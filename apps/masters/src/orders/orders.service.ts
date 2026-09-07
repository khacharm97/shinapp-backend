import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsService: ClientProxy,
  ) {}

  async createOrder(data: any) {
    const { initiatorId, techniqueId, clientId, description, imageUrl, startDate, endDate, paymentMethod, price, address, latitude, longitude, privacyAccepted } = data;
    let { masterId } = data;

    // A technique booking derives its master (the technique's owner) from the
    // technique itself, so the client can never book on someone else's behalf.
    if (techniqueId) {
      const technique = await this.prisma.technique.findUnique({ where: { id: techniqueId } });
      if (!technique) {
        return { error: 'Technique not found' };
      }
      if (technique.ownerId === clientId) {
        return { error: 'You cannot order your own technique' };
      }
      masterId = technique.ownerId;
    }

    // Ensure the users exist
    const client = await this.prisma.user.findUnique({ where: { id: clientId } });
    const master = await this.prisma.user.findUnique({ where: { id: masterId } });

    if (!client || !master) {
      return { error: 'Client or Master not found' };
    }

    const order = await this.prisma.order.create({
      data: {
        clientId,
        masterId,
        initiatorId,
        techniqueId: techniqueId || null,
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
        client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        master: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        technique: { select: { id: true, name: true } },
      }
    });

    const receiverId = initiatorId === clientId ? masterId : clientId;

    this.notificationsService.emit(
      { cmd: 'create-notification' },
      {
        userId: receiverId,
        type: NotificationType.ORDER_INVITE,
        title: 'New Order Request',
        message: `You have received a new order request from ${initiatorId === clientId ? (client.name || 'a client') : (master.name || 'a master')}.`,
        metadata: { orderId: order.id },
      }
    );

    return order;
  }

  async getMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: {
        OR: [
          { clientId: userId },
          { masterId: userId }
        ]
      },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        master: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        technique: { select: { id: true, name: true } },
        reviews: { select: { id: true, authorId: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        master: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        technique: { select: { id: true, name: true } },
        reviews: { select: { id: true, authorId: true } }
      }
    });

    if (!order) {
      return { error: 'Order not found' };
    }

    if (order.clientId !== userId && order.masterId !== userId) {
      return { error: 'Unauthorized to view this order' };
    }

    return order;
  }

  async updateOrder(data: any) {
    const { orderId, initiatorId, description, imageUrl, startDate, endDate, paymentMethod, price, address, latitude, longitude, privacyAccepted } = data;

    const existing = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) return { error: 'Order not found' };

    if (existing.clientId !== initiatorId && existing.masterId !== initiatorId) {
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
        client: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        master: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
      }
    });

    const receiverId = initiatorId === updated.clientId ? updated.masterId : updated.clientId;
    const initiatorName = initiatorId === updated.clientId ? (updated.client.name || 'Client') : (updated.master.name || 'Master');

    this.notificationsService.emit(
      { cmd: 'create-notification' },
      {
        userId: receiverId,
        type: NotificationType.ORDER_UPDATE,
        title: 'Order Updated',
        message: `${initiatorName} has proposed new terms for your order.`,
        metadata: { orderId: updated.id },
      }
    );

    return updated;
  }

  async acceptOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) return { error: 'Order not found' };
    if (order.clientId !== userId && order.masterId !== userId) return { error: 'Unauthorized' };

    // The person accepting must NOT be the initiator
    if (order.initiatorId === userId) {
      return { error: 'You cannot accept an order you proposed. Wait for the other party.' };
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'ACCEPTED' },
      include: {
        client: { select: { id: true, name: true } },
        master: { select: { id: true, name: true } }
      }
    });

    const receiverId = order.initiatorId;
    const accepterName = userId === updated.clientId ? (updated.client.name || 'Client') : (updated.master.name || 'Master');

    this.notificationsService.emit(
      { cmd: 'create-notification' },
      {
        userId: receiverId,
        type: NotificationType.ORDER_ACCEPTED,
        title: 'Order Accepted',
        message: `${accepterName} has accepted the order terms.`,
        metadata: { orderId: updated.id },
      }
    );

    return updated;
  }

  async rejectOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) return { error: 'Order not found' };
    if (order.clientId !== userId && order.masterId !== userId) return { error: 'Unauthorized' };

    // The person rejecting must NOT be the initiator
    if (order.initiatorId === userId) {
      return { error: 'You cannot reject an order you proposed. You can only cancel it.' };
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'REJECTED' },
      include: {
        client: { select: { id: true, name: true } },
        master: { select: { id: true, name: true } }
      }
    });

    const receiverId = order.initiatorId;
    const rejecterName = userId === updated.clientId ? (updated.client.name || 'Client') : (updated.master.name || 'Master');

    this.notificationsService.emit(
      { cmd: 'create-notification' },
      {
        userId: receiverId,
        type: NotificationType.ORDER_REJECTED,
        title: 'Order Rejected',
        message: `${rejecterName} has rejected the order terms.`,
        metadata: { orderId: updated.id },
      }
    );

    return updated;
  }

  async requestOrderCompletion(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) return { error: 'Order not found' };
    if (order.clientId !== userId && order.masterId !== userId) return { error: 'Unauthorized' };
    if (order.status !== 'ACCEPTED') return { error: 'Only accepted orders can be requested for completion' };

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETION_REQUESTED',
        initiatorId: userId
      },
      include: {
        client: { select: { id: true, name: true } },
        master: { select: { id: true, name: true } }
      }
    });

    const receiverId = userId === updated.clientId ? updated.masterId : updated.clientId;
    const requesterName = userId === updated.clientId ? (updated.client.name || 'Client') : (updated.master.name || 'Master');

    this.notificationsService.emit(
      { cmd: 'create-notification' },
      {
        userId: receiverId,
        type: 'SYSTEM',
        title: 'Order Completion Requested',
        message: `${requesterName} has marked the order as completed. Please confirm.`,
        metadata: { orderId: updated.id },
      }
    );

    return updated;
  }

  async acceptOrderCompletion(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (!order) return { error: 'Order not found' };
    if (order.clientId !== userId && order.masterId !== userId) return { error: 'Unauthorized' };
    if (order.status !== 'COMPLETION_REQUESTED') return { error: 'Order is not pending completion' };
    if (order.initiatorId === userId) return { error: 'You cannot accept your own completion request' };

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' },
      include: {
        client: { select: { id: true, name: true } },
        master: { select: { id: true, name: true } }
      }
    });

    const receiverId = order.initiatorId;
    const accepterName = userId === updated.clientId ? (updated.client.name || 'Client') : (updated.master.name || 'Master');

    this.notificationsService.emit(
      { cmd: 'create-notification' },
      {
        userId: receiverId,
        type: 'SYSTEM',
        title: 'Order Completed',
        message: `${accepterName} has confirmed the order is completed.`,
        metadata: { orderId: updated.id },
      }
    );

    return updated;
  }

  async getBusyDatesForMaster(masterId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        masterId,
        status: { in: ['ACCEPTED', 'COMPLETION_REQUESTED'] }
      },
      select: {
        startDate: true,
        endDate: true
      }
    });

    return orders;
  }
}
