import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrigadesService {
  constructor(
    private prisma: PrismaService,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsService: ClientProxy,
  ) {}

  async getBrigadeById(id: string) {
    const brigade = await this.prisma.brigade.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            userInfo: true,
          },
        },
        members: {
          where: { status: 'ACCEPTED' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                userInfo: true,
                portfolios: true,
              },
            },
          },
        },
      },
    });

    if (!brigade) {
      throw new NotFoundException('Brigade not found');
    }

    return brigade;
  }

  async createBrigade(data: {
    ownerId: string;
    name: string;
    about?: string;
    invites: string[];
  }) {
    const { ownerId, name, about, invites } = data;

    if (!name || name.trim() === '') {
      return { error: 'Brigade name is required' };
    }

    const uniqueInvites = [...new Set(invites)];
    const invalidInvites: string[] = [];
    const validUserIds: string[] = [];

    for (const invite of uniqueInvites) {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: invite },
            { phone: invite },
            { name: { contains: invite, mode: 'insensitive' } },
          ],
        },
      });

      if (!user || !user.roles.includes('MASTER')) {
        invalidInvites.push(invite);
      } else if (user.id === ownerId) {
        // can't invite yourself
        invalidInvites.push(invite + ' (cannot invite yourself)');
      } else {
        validUserIds.push(user.id);
      }
    }

    if (invalidInvites.length > 0) {
      return {
        error: `Invalid invites: The following users were not found, are not masters, or are invalid: ${invalidInvites.join(', ')}`,
      };
    }

    const brigade = await this.prisma.brigade.create({
      data: {
        name,
        about,
        ownerId,
        members: {
          create: validUserIds.map((userId) => ({
            userId,
            status: 'PENDING',
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
    // Create notifications for invited users
    for (const userId of validUserIds) {
      this.notificationsService.emit(
        { cmd: 'create-notification' },
        {
          userId,
          type: NotificationType.BRIGADE_INVITE,
          title: 'Brigade Invitation',
          message: `You have been invited to join the brigade "${brigade.name}".`,
          metadata: { brigadeId: brigade.id },
        },
      );
    }

    return brigade;
  }

  async getBrigadesByOwnerId(ownerId: string) {
    return this.prisma.brigade.findMany({
      where: { ownerId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Search for masters that can be invited into a brigade.
   * Unlike the public `globalSearch`, this is auth-gated and allows lookup by
   * phone / email, and it excludes the requester plus anyone already tied to
   * the brigade so the frontend does not have to post-filter the results.
   */
  async searchBrigadeInvitees(data: {
    requesterId: string;
    search: string;
    brigadeId?: string;
    limit?: number;
  }) {
    const { requesterId, brigadeId } = data;
    const search = (data.search || '').trim();
    const limit = Math.min(data.limit && data.limit > 0 ? data.limit : 5, 20);

    if (search.length < 2) {
      return { items: [] };
    }

    // Never suggest the requester, or masters already invited / in this brigade
    const excludeUserIds = new Set<string>([requesterId]);
    if (brigadeId) {
      const members = await this.prisma.brigadeMember.findMany({
        where: { brigadeId },
        select: { userId: true },
      });
      members.forEach((m) => excludeUserIds.add(m.userId));
    }

    const items = await this.prisma.user.findMany({
      where: {
        roles: { has: 'MASTER' },
        isBlocked: false,
        id: { notIn: [...excludeUserIds] },
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

  async deleteBrigade(data: { ownerId: string; brigadeId: string }) {
    const { ownerId, brigadeId } = data;

    const brigade = await this.prisma.brigade.findFirst({
      where: { id: brigadeId, ownerId },
    });

    if (!brigade) {
      return { error: 'Brigade not found or unauthorized' };
    }

    await this.prisma.brigade.delete({
      where: { id: brigadeId },
    });

    return { success: true };
  }

  async updateBrigade(data: {
    ownerId: string;
    brigadeId: string;
    name: string;
    about?: string;
    invites: string[];
    removeMemberIds: string[];
  }) {
    const { ownerId, brigadeId, name, about, invites, removeMemberIds } = data;

    const brigade = await this.prisma.brigade.findFirst({
      where: { id: brigadeId, ownerId },
    });

    if (!brigade) {
      return { error: 'Brigade not found or unauthorized' };
    }

    if (!name || name.trim() === '') {
      return { error: 'Brigade name is required' };
    }

    const uniqueInvites = [...new Set(invites)];
    const invalidInvites: string[] = [];
    const validUserIds: string[] = [];

    for (const invite of uniqueInvites) {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: invite },
            { phone: invite },
            { name: { contains: invite, mode: 'insensitive' } },
          ],
        },
      });

      if (!user || !user.roles.includes('MASTER')) {
        invalidInvites.push(invite);
      } else if (user.id === ownerId) {
        invalidInvites.push(invite + ' (cannot invite yourself)');
      } else {
        const existingMember = await this.prisma.brigadeMember.findFirst({
          where: { brigadeId, userId: user.id },
        });
        if (!existingMember) {
          validUserIds.push(user.id);
        }
      }
    }

    if (invalidInvites.length > 0) {
      return {
        error: `Invalid invites: The following users were not found, are not masters, or are invalid: ${invalidInvites.join(', ')}`,
      };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.brigade.update({
        where: { id: brigadeId },
        data: { name, about },
      });

      if (removeMemberIds && removeMemberIds.length > 0) {
        await tx.brigadeMember.deleteMany({
          where: {
            id: { in: removeMemberIds },
            brigadeId: brigadeId,
          },
        });
      }

      if (validUserIds.length > 0) {
        await tx.brigadeMember.createMany({
          data: validUserIds.map((userId) => ({
            brigadeId,
            userId,
            status: 'PENDING',
          })),
        });
      }
    });

    for (const userId of validUserIds) {
      this.notificationsService.emit(
        { cmd: 'create-notification' },
        {
          userId,
          type: NotificationType.BRIGADE_INVITE,
          title: 'Brigade Invitation',
          message: `You have been invited to join the brigade "${name}".`,
          metadata: { brigadeId },
        },
      );
    }

    return this.prisma.brigade.findUnique({
      where: { id: brigadeId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async acceptBrigadeInvite(data: { userId: string; brigadeId: string }) {
    const { userId, brigadeId } = data;
    const member = await this.prisma.brigadeMember.findFirst({
      where: { userId, brigadeId, status: 'PENDING' },
    });

    if (!member) {
      return { error: 'Invite not found or already accepted/rejected' };
    }

    await this.prisma.brigadeMember.update({
      where: { id: member.id },
      data: { status: 'ACCEPTED' },
    });

    const brigade = await this.prisma.brigade.findUnique({
      where: { id: brigadeId },
      include: { owner: true },
    });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (brigade && user) {
      this.notificationsService.emit(
        { cmd: 'create-notification' },
        {
          userId: brigade.ownerId,
          type: NotificationType.SYSTEM,
          title: 'Invite Accepted',
          message: `${user.name || user.email || user.phone} has accepted your invite to join "${brigade.name}".`,
          metadata: { brigadeId: brigade.id, memberId: userId },
        },
      );

      // Emit WS event directly to API Gateway to invalidate My Brigades cache
      this.notificationsService.emit(
        { cmd: 'send-ws-event' },
        {
          userId: brigade.ownerId,
          event: 'brigade_updated',
          payload: { brigadeId: brigade.id },
        },
      );
    }

    return { success: true };
  }

  async rejectBrigadeInvite(data: { userId: string; brigadeId: string }) {
    const { userId, brigadeId } = data;
    const member = await this.prisma.brigadeMember.findFirst({
      where: { userId, brigadeId, status: 'PENDING' },
    });

    if (!member) {
      return { error: 'Invite not found or already accepted/rejected' };
    }

    await this.prisma.brigadeMember.update({
      where: { id: member.id },
      data: { status: 'REJECTED' },
    });

    const brigade = await this.prisma.brigade.findUnique({
      where: { id: brigadeId },
      include: { owner: true },
    });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (brigade && user) {
      this.notificationsService.emit(
        { cmd: 'create-notification' },
        {
          userId: brigade.ownerId,
          type: NotificationType.SYSTEM,
          title: 'Invite Rejected',
          message: `${user.name || user.email || user.phone} has rejected your invite to join "${brigade.name}".`,
          metadata: { brigadeId: brigade.id, memberId: userId },
        },
      );

      // Emit WS event directly to API Gateway to invalidate My Brigades cache
      this.notificationsService.emit(
        { cmd: 'send-ws-event' },
        {
          userId: brigade.ownerId,
          event: 'brigade_updated',
          payload: { brigadeId: brigade.id },
        },
      );
    }

    return { success: true };
  }
}
