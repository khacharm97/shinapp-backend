import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsService: ClientProxy,
  ) {}

  /**
   * A master/company who hasn't opted into multipleJobs can only run one job
   * at a time. Returns an error string if `masterId` already has another
   * active order whose date range overlaps [startDate, endDate] - a busy
   * period of 10/06-10/09 blocks 10/08-10/13 (overlaps) but not 10/10-10/20
   * (back-to-back, no overlap). Optionally ignores one order, e.g. the one
   * being accepted.
   */
  private async checkMasterAvailability(
    masterId: string,
    startDate: Date,
    endDate: Date,
    ignoreOrderId?: string,
  ) {
    const master = await this.prisma.user.findUnique({
      where: { id: masterId },
      include: { userInfo: true },
    });
    if (master?.userInfo?.multipleJobs) return null;

    const activeOrder = await this.prisma.order.findFirst({
      where: {
        masterId,
        status: { in: ['ACCEPTED', 'COMPLETION_REQUESTED'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        ...(ignoreOrderId ? { id: { not: ignoreOrderId } } : {}),
      },
    });
    if (activeOrder) {
      // A stable code, not a human sentence - the frontend maps this to a
      // translated message the same way it does for auth_error_user_blocked.
      return 'order_master_busy';
    }
    return null;
  }

  /**
   * A manually-added busy period (vacation, a job outside the platform, etc.)
   * blocks orders unconditionally - unlike checkMasterAvailability, this does
   * NOT respect multipleJobs, since it represents the master being unavailable
   * at all, not just already handling another client's job.
   */
  private async checkCustomBusyPeriod(
    masterId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const overlapping = await this.prisma.busyPeriod.findFirst({
      where: {
        masterId,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });
    if (overlapping) {
      return 'order_master_unavailable';
    }
    return null;
  }

  /**
   * Same idea as checkMasterAvailability, but for a brigade member being
   * assigned to work an order - checks both the member's own orders and any
   * OTHER order they're already assigned to (excluding this one, since we're
   * about to (re)write its assignments anyway).
   */
  private async checkMemberAssignmentAvailability(
    memberId: string,
    startDate: Date,
    endDate: Date,
    currentOrderId: string,
  ) {
    const member = await this.prisma.user.findUnique({
      where: { id: memberId },
      include: { userInfo: true },
    });
    if (member?.userInfo?.multipleJobs) return null;

    const ownOrder = await this.prisma.order.findFirst({
      where: {
        masterId: memberId,
        id: { not: currentOrderId },
        status: { in: ['ACCEPTED', 'COMPLETION_REQUESTED'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });
    if (ownOrder) return 'order_master_busy';

    const conflictingAssignment = await this.prisma.orderAssignment.findFirst({
      where: {
        memberId,
        orderId: { not: currentOrderId },
        order: {
          status: { in: ['ACCEPTED', 'COMPLETION_REQUESTED'] },
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      },
    });
    if (conflictingAssignment) return 'order_master_busy';

    return null;
  }

  async listBusyPeriods(masterId: string) {
    return this.prisma.busyPeriod.findMany({
      where: { masterId },
      orderBy: { startDate: 'asc' },
    });
  }

  async createBusyPeriod(
    masterId: string,
    startDate: Date,
    endDate: Date,
    note?: string,
  ) {
    if (
      !(startDate instanceof Date) ||
      isNaN(startDate.getTime()) ||
      !(endDate instanceof Date) ||
      isNaN(endDate.getTime())
    ) {
      // A stable code, not a human sentence - the frontend maps this to a
      // translated message the same way it does for order_master_busy.
      return { error: 'busy_day_invalid_dates' };
    }
    if (endDate < startDate) {
      // A stable code, not a human sentence - the frontend maps this to a
      // translated message the same way it does for order_master_busy.
      return { error: 'busy_day_end_before_start' };
    }
    return this.prisma.busyPeriod.create({
      data: { masterId, startDate, endDate, note: note || null },
    });
  }

  async deleteBusyPeriod(masterId: string, id: string) {
    const period = await this.prisma.busyPeriod.findUnique({ where: { id } });
    if (!period || period.masterId !== masterId) {
      return { error: 'Busy period not found' };
    }
    await this.prisma.busyPeriod.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Search for users a master/company can propose an order to directly
   * (rather than waiting for a client to find them). Mirrors
   * searchBrigadeInvitees: auth-gated lookup by name/email/phone, but with no
   * role restriction since the other side of an order can be any registered
   * user, not just masters.
   */
  async searchOrderClients(data: {
    requesterId: string;
    search: string;
    limit?: number;
  }) {
    const search = (data.search || '').trim();
    const limit = Math.min(data.limit && data.limit > 0 ? data.limit : 5, 20);

    if (search.length < 2) {
      return { items: [] };
    }

    const items = await this.prisma.user.findMany({
      where: {
        id: { not: data.requesterId },
        isBlocked: false,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { equals: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return { items };
  }

  async createOrder(data: any) {
    const {
      initiatorId,
      techniqueId,
      brigadeId,
      clientId,
      description,
      imageUrl,
      startDate,
      endDate,
      paymentMethod,
      price,
      address,
      latitude,
      longitude,
      privacyAccepted,
    } = data;
    let { masterId } = data;
    let brigadeName: string | undefined;

    // A technique booking derives its master (the technique's owner) from the
    // technique itself, so the client can never book on someone else's behalf.
    if (techniqueId) {
      const technique = await this.prisma.technique.findUnique({
        where: { id: techniqueId },
      });
      if (!technique) {
        return { error: 'Technique not found' };
      }
      if (technique.ownerId === clientId) {
        return { error: 'You cannot order your own technique' };
      }
      masterId = technique.ownerId;
    }

    // A brigade order is a contract with the brigade owner - the owner is
    // who accepts it, and staffs it afterwards via assignOrderMembers.
    // `masterId` is derived from the brigade, never trusted from the client.
    if (brigadeId) {
      const brigade = await this.prisma.brigade.findUnique({
        where: { id: brigadeId },
      });
      if (!brigade) {
        return { error: 'Brigade not found' };
      }
      masterId = brigade.ownerId;
      brigadeName = brigade.name;
    }

    if (clientId === masterId) {
      return { error: 'Client and master cannot be the same user' };
    }

    // The caller must be one of the two parties on the order - otherwise
    // anyone could invent orders between two unrelated other users.
    if (initiatorId !== clientId && initiatorId !== masterId) {
      return {
        error: 'You must be either the client or the master on this order',
      };
    }

    // Ensure the users exist
    const client = await this.prisma.user.findUnique({
      where: { id: clientId },
    });
    const master = await this.prisma.user.findUnique({
      where: { id: masterId },
    });

    if (!client || !master) {
      return { error: 'Client or Master not found' };
    }

    const availabilityError = await this.checkMasterAvailability(
      masterId,
      new Date(startDate),
      new Date(endDate),
    );
    if (availabilityError) {
      return { error: availabilityError };
    }

    const busyPeriodError = await this.checkCustomBusyPeriod(
      masterId,
      new Date(startDate),
      new Date(endDate),
    );
    if (busyPeriodError) {
      return { error: busyPeriodError };
    }

    const order = await this.prisma.order.create({
      data: {
        clientId,
        masterId,
        initiatorId,
        techniqueId: techniqueId || null,
        brigadeId: brigadeId || null,
        description,
        imageUrl,
        startDate,
        endDate,
        paymentMethod,
        price,
        address,
        latitude,
        longitude,
        privacyAccepted,
        status: 'PENDING',
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        master: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        technique: { select: { id: true, name: true } },
        brigade: { select: { id: true, name: true } },
      },
    });

    const receiverId = initiatorId === clientId ? masterId : clientId;
    const requesterName =
      initiatorId === clientId
        ? client.name || 'a client'
        : master.name || 'a master';

    this.notificationsService.emit(
      { cmd: 'create-notification' },
      {
        userId: receiverId,
        type: NotificationType.ORDER_INVITE,
        title: 'New Order Request',
        message: brigadeName
          ? `You have received a new order request for your brigade "${brigadeName}" from ${requesterName}.`
          : `You have received a new order request from ${requesterName}.`,
        metadata: {
          orderId: order.id,
          i18n: brigadeName
            ? {
                titleKey: 'notif_order_request_title',
                messageKey: 'notif_brigade_order_request_message',
                params: { name: requesterName, brigade: brigadeName },
              }
            : {
                titleKey: 'notif_order_request_title',
                messageKey: 'notif_order_request_message',
                params: { name: requesterName },
              },
        },
      },
    );

    return order;
  }

  async getMyOrders(userId: string) {
    // A brigade member assigned to an order should see it too, even though
    // they're neither the client nor the contracting masterId (the owner).
    const assignedOrderIds = await this.prisma.orderAssignment.findMany({
      where: { memberId: userId },
      select: { orderId: true },
    });

    return this.prisma.order.findMany({
      where: {
        OR: [
          { clientId: userId },
          { masterId: userId },
          { id: { in: assignedOrderIds.map((a) => a.orderId) } },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        master: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        technique: { select: { id: true, name: true } },
        brigade: { select: { id: true, name: true } },
        assignments: {
          include: {
            member: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        reviews: { select: { id: true, authorId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        master: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        technique: { select: { id: true, name: true } },
        brigade: { select: { id: true, name: true } },
        assignments: {
          include: {
            member: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        reviews: { select: { id: true, authorId: true } },
      },
    });

    if (!order) {
      return { error: 'Order not found' };
    }

    const isAssignedMember = order.assignments.some(
      (a) => a.memberId === userId,
    );
    if (
      order.clientId !== userId &&
      order.masterId !== userId &&
      !isAssignedMember
    ) {
      return { error: 'Unauthorized to view this order' };
    }

    return order;
  }

  async updateOrder(data: any) {
    const {
      orderId,
      initiatorId,
      description,
      imageUrl,
      startDate,
      endDate,
      paymentMethod,
      price,
      address,
      latitude,
      longitude,
      privacyAccepted,
    } = data;

    const existing = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!existing) return { error: 'Order not found' };

    if (
      existing.clientId !== initiatorId &&
      existing.masterId !== initiatorId
    ) {
      return { error: 'Unauthorized to edit this order' };
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        initiatorId, // The one proposing the new terms
        description,
        startDate,
        endDate,
        paymentMethod,
        price,
        address,
        latitude,
        longitude,
        privacyAccepted,
        status: 'PENDING', // Revert to pending for the other party to review
        ...(imageUrl !== undefined ? { imageUrl } : {}),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        master: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    const receiverId =
      initiatorId === updated.clientId ? updated.masterId : updated.clientId;
    const initiatorName =
      initiatorId === updated.clientId
        ? updated.client.name || 'Client'
        : updated.master.name || 'Master';

    this.notificationsService.emit(
      { cmd: 'create-notification' },
      {
        userId: receiverId,
        type: NotificationType.ORDER_UPDATE,
        title: 'Order Updated',
        message: `${initiatorName} has proposed new terms for your order.`,
        metadata: {
          orderId: updated.id,
          i18n: {
            titleKey: 'notif_order_updated_title',
            messageKey: 'notif_order_updated_message',
            params: { name: initiatorName },
          },
        },
      },
    );

    return updated;
  }

  async acceptOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return { error: 'Order not found' };
    if (order.clientId !== userId && order.masterId !== userId)
      return { error: 'Unauthorized' };

    // The person accepting must NOT be the initiator
    if (order.initiatorId === userId) {
      return {
        error:
          'You cannot accept an order you proposed. Wait for the other party.',
      };
    }

    const availabilityError = await this.checkMasterAvailability(
      order.masterId,
      order.startDate,
      order.endDate,
      order.id,
    );
    if (availabilityError) {
      return { error: availabilityError };
    }

    const busyPeriodError = await this.checkCustomBusyPeriod(
      order.masterId,
      order.startDate,
      order.endDate,
    );
    if (busyPeriodError) {
      return { error: busyPeriodError };
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'ACCEPTED' },
      include: {
        client: { select: { id: true, name: true } },
        master: { select: { id: true, name: true } },
      },
    });

    const receiverId = order.initiatorId;
    const accepterName =
      userId === updated.clientId
        ? updated.client.name || 'Client'
        : updated.master.name || 'Master';

    this.notificationsService.emit(
      { cmd: 'create-notification' },
      {
        userId: receiverId,
        type: NotificationType.ORDER_ACCEPTED,
        title: 'Order Accepted',
        message: `${accepterName} has accepted the order terms.`,
        metadata: {
          orderId: updated.id,
          i18n: {
            titleKey: 'notif_order_accepted_title',
            messageKey: 'notif_order_accepted_message',
            params: { name: accepterName },
          },
        },
      },
    );

    return updated;
  }

  async rejectOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return { error: 'Order not found' };
    if (order.clientId !== userId && order.masterId !== userId)
      return { error: 'Unauthorized' };

    // The person rejecting must NOT be the initiator
    if (order.initiatorId === userId) {
      return {
        error:
          'You cannot reject an order you proposed. You can only cancel it.',
      };
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'REJECTED' },
      include: {
        client: { select: { id: true, name: true } },
        master: { select: { id: true, name: true } },
      },
    });

    const receiverId = order.initiatorId;
    const rejecterName =
      userId === updated.clientId
        ? updated.client.name || 'Client'
        : updated.master.name || 'Master';

    this.notificationsService.emit(
      { cmd: 'create-notification' },
      {
        userId: receiverId,
        type: NotificationType.ORDER_REJECTED,
        title: 'Order Rejected',
        message: `${rejecterName} has rejected the order terms.`,
        metadata: {
          orderId: updated.id,
          i18n: {
            titleKey: 'notif_order_rejected_title',
            messageKey: 'notif_order_rejected_message',
            params: { name: rejecterName },
          },
        },
      },
    );

    return updated;
  }

  async requestOrderCompletion(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return { error: 'Order not found' };
    if (order.clientId !== userId && order.masterId !== userId)
      return { error: 'Unauthorized' };
    if (order.status !== 'ACCEPTED')
      return { error: 'Only accepted orders can be requested for completion' };

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETION_REQUESTED',
        initiatorId: userId,
      },
      include: {
        client: { select: { id: true, name: true } },
        master: { select: { id: true, name: true } },
      },
    });

    const receiverId =
      userId === updated.clientId ? updated.masterId : updated.clientId;
    const requesterName =
      userId === updated.clientId
        ? updated.client.name || 'Client'
        : updated.master.name || 'Master';

    this.notificationsService.emit(
      { cmd: 'create-notification' },
      {
        userId: receiverId,
        type: 'SYSTEM',
        title: 'Order Completion Requested',
        message: `${requesterName} has marked the order as completed. Please confirm.`,
        metadata: {
          orderId: updated.id,
          i18n: {
            titleKey: 'notif_order_completion_requested_title',
            messageKey: 'notif_order_completion_requested_message',
            params: { name: requesterName },
          },
        },
      },
    );

    return updated;
  }

  async acceptOrderCompletion(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return { error: 'Order not found' };
    if (order.clientId !== userId && order.masterId !== userId)
      return { error: 'Unauthorized' };
    if (order.status !== 'COMPLETION_REQUESTED')
      return { error: 'Order is not pending completion' };
    if (order.initiatorId === userId)
      return { error: 'You cannot accept your own completion request' };

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' },
      include: {
        client: { select: { id: true, name: true } },
        master: { select: { id: true, name: true } },
      },
    });

    const receiverId = order.initiatorId;
    const accepterName =
      userId === updated.clientId
        ? updated.client.name || 'Client'
        : updated.master.name || 'Master';

    this.notificationsService.emit(
      { cmd: 'create-notification' },
      {
        userId: receiverId,
        type: 'SYSTEM',
        title: 'Order Completed',
        message: `${accepterName} has confirmed the order is completed.`,
        metadata: {
          orderId: updated.id,
          i18n: {
            titleKey: 'notif_order_completed_title',
            messageKey: 'notif_order_completed_message',
            params: { name: accepterName },
          },
        },
      },
    );

    return updated;
  }

  /**
   * The brigade owner staffs an accepted brigade order with specific
   * members. Replaces the order's whole assignment roster with `memberIds`
   * (an empty array clears it) - each id must be the owner themself or an
   * ACCEPTED member of the order's brigade, and free for the order's dates.
   * Newly-added members are notified and, if a chat thread already exists
   * for this order, pulled into it.
   */
  async assignOrderMembers(
    ownerId: string,
    orderId: string,
    memberIds: string[],
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) return { error: 'Order not found' };
    if (order.masterId !== ownerId) return { error: 'Unauthorized' };
    if (!order.brigadeId) return { error: 'This order is not a brigade order' };
    if (order.status !== 'ACCEPTED') {
      return { error: 'Only accepted orders can be staffed' };
    }

    // The owner can always assign themself; only non-owner ids need a
    // brigade-membership check.
    const uniqueMemberIds = [...new Set(memberIds)];
    const nonOwnerIds = uniqueMemberIds.filter((id) => id !== ownerId);
    if (nonOwnerIds.length > 0) {
      const acceptedMembers = await this.prisma.brigadeMember.findMany({
        where: {
          brigadeId: order.brigadeId,
          userId: { in: nonOwnerIds },
          status: 'ACCEPTED',
        },
        select: { userId: true },
      });
      const acceptedIds = new Set(acceptedMembers.map((m) => m.userId));
      const invalidIds = nonOwnerIds.filter((id) => !acceptedIds.has(id));
      if (invalidIds.length > 0) {
        return { error: 'Some members are not in this brigade' };
      }
    }

    for (const memberId of uniqueMemberIds) {
      const availabilityError = await this.checkMemberAssignmentAvailability(
        memberId,
        order.startDate,
        order.endDate,
        order.id,
      );
      if (availabilityError) return { error: availabilityError };

      const busyPeriodError = await this.checkCustomBusyPeriod(
        memberId,
        order.startDate,
        order.endDate,
      );
      if (busyPeriodError) return { error: busyPeriodError };
    }

    const existing = await this.prisma.orderAssignment.findMany({
      where: { orderId },
      select: { memberId: true },
    });
    const existingIds = new Set(existing.map((a) => a.memberId));
    const newlyAssignedIds = uniqueMemberIds.filter(
      (id) => !existingIds.has(id),
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.orderAssignment.deleteMany({ where: { orderId } });
      if (uniqueMemberIds.length > 0) {
        await tx.orderAssignment.createMany({
          data: uniqueMemberIds.map((memberId) => ({ orderId, memberId })),
        });
      }
    });

    if (newlyAssignedIds.length > 0) {
      const conversation = await this.prisma.conversation.findFirst({
        where: { orderId },
        include: { participants: true },
      });
      if (conversation) {
        const existingParticipantIds = new Set(
          conversation.participants.map((p) => p.userId),
        );
        const toAdd = newlyAssignedIds.filter(
          (id) => !existingParticipantIds.has(id),
        );
        if (toAdd.length > 0) {
          await this.prisma.conversationParticipant.createMany({
            data: toAdd.map((userId) => ({
              conversationId: conversation.id,
              userId,
            })),
          });
        }
      }

      for (const memberId of newlyAssignedIds) {
        this.notificationsService.emit(
          { cmd: 'create-notification' },
          {
            userId: memberId,
            type: NotificationType.ORDER_ASSIGNED,
            title: 'Assigned to a Job',
            message: `You've been assigned to an order for "${order.description}".`,
            metadata: {
              orderId: order.id,
              i18n: {
                titleKey: 'notif_order_assigned_title',
                messageKey: 'notif_order_assigned_message',
                params: { description: order.description },
              },
            },
          },
        );
      }
    }

    return this.getOrderById(ownerId, orderId);
  }

  async getBusyDatesForMaster(masterId: string) {
    const [orders, busyPeriods, assignments] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          masterId,
          status: { in: ['ACCEPTED', 'COMPLETION_REQUESTED'] },
        },
        select: {
          startDate: true,
          endDate: true,
        },
      }),
      this.prisma.busyPeriod.findMany({
        where: { masterId },
        select: {
          startDate: true,
          endDate: true,
        },
      }),
      this.prisma.orderAssignment.findMany({
        where: {
          memberId: masterId,
          order: { status: { in: ['ACCEPTED', 'COMPLETION_REQUESTED'] } },
        },
        select: {
          order: { select: { startDate: true, endDate: true } },
        },
      }),
    ]);

    return [...orders, ...busyPeriods, ...assignments.map((a) => a.order)];
  }
}
