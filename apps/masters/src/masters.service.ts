import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationType } from '@prisma/client';

@Injectable()
export class MastersService {
  constructor(
    private prisma: PrismaService,
    @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsService: ClientProxy,
  ) {}

  async getMasters(
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      regionId?: string;
      cityId?: string;
      topRated?: boolean;
      availableNow?: boolean;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      roles: {
        has: 'MASTER',
      },
      verifiedAt: {
        not: null,
      },
      isBlocked: false,
    };

    const AND: any[] = [];
    if (filters?.regionId)
      AND.push({ userInfo: { is: { regionId: filters.regionId } } });
    if (filters?.cityId)
      AND.push({ userInfo: { is: { cityId: filters.cityId } } });
    if (filters?.topRated)
      AND.push({ userInfo: { is: { topRated: filters.topRated } } });
    if (filters?.availableNow)
      AND.push({ userInfo: { is: { availableNow: filters.availableNow } } });

    if (filters?.search) {
      const searchStr = filters.search;

      const matchingSkills = await this.prisma.skill.findMany({
        where: {
          approved: true,
          OR: [
            { nameAm: { contains: searchStr, mode: 'insensitive' } },
            { nameRu: { contains: searchStr, mode: 'insensitive' } },
            { nameEn: { contains: searchStr, mode: 'insensitive' } },
            { nameFa: { contains: searchStr, mode: 'insensitive' } },
            { key: { contains: searchStr, mode: 'insensitive' } },
          ],
        },
      });

      const matchingSkillKeys = matchingSkills.map((s) => s.key);

      AND.push({
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          matchingSkillKeys.length > 0
            ? { userInfo: { is: { skills: { hasSome: matchingSkillKeys } } } }
            : { id: 'no-match-skill' },
        ],
      });
    }

    if (AND.length > 0) {
      where.AND = AND;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { userInfo: true },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where,
      }),
    ]);

    // Sanitize output
    const sanitizedItems = items.map(({ password, ...rest }) => rest);

    return {
      items: sanitizedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async globalSearch(
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      regionId?: string;
      cityId?: string;
      topRated?: boolean;
      availableNow?: boolean;
    },
  ) {
    const mastersData = await this.getMasters(page, limit, filters);

    // Future: add queries for techniques, calculators, etc. here

    return {
      masters: mastersData,
    };
  }

  async getMasterById(id: string) {
    const master = await this.prisma.user.findUnique({
      where: {
        id,
        roles: {
          has: 'MASTER',
        },
      },
      include: {
        userInfo: true,
        portfolios: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!master) {
      throw new NotFoundException('Master not found');
    }

    const { password, ...sanitizedMaster } = master;
    return sanitizedMaster;
  }

  async getSkills(approvedOnly: boolean = true) {
    return this.prisma.skill.findMany({
      where: approvedOnly ? { approved: true } : undefined,
      orderBy: { nameEn: 'asc' },
    });
  }

  async suggestSkill(data: {
    key: string;
    nameEn: string;
    nameAm: string;
    nameRu: string;
    nameFa: string;
  }) {
    return this.prisma.skill.create({
      data: {
        ...data,
        approved: false,
      },
    });
  }

  async createBrigade(data: { ownerId: string; name: string; invites: string[] }) {
    const { ownerId, name, invites } = data;

    if (!name || name.trim() === '') {
      return { error: 'Brigade name is required' };
    }

    const uniqueInvites = [...new Set(invites)];
    const invalidInvites: string[] = [];
    const validUserIds: string[] = [];

    for (const invite of uniqueInvites) {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ email: invite }, { phone: invite }],
        },
      });

      if (!user || !user.roles.includes('MASTER')) {
        invalidInvites.push(invite);
      } else if (user.id === ownerId) {
        // can't invite yourself
        invalidInvites.push(invite + " (cannot invite yourself)");
      } else {
        validUserIds.push(user.id);
      }
    }

    if (invalidInvites.length > 0) {
      return { error: `Invalid invites: The following users were not found, are not masters, or are invalid: ${invalidInvites.join(', ')}` };
    }

    const brigade = await this.prisma.brigade.create({
      data: {
        name,
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
              select: { id: true, name: true, email: true, phone: true, avatarUrl: true }
            }
          }
        }
      }
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
        }
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
            user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteBrigade(data: { ownerId: string; brigadeId: string }) {
    const { ownerId, brigadeId } = data;
    
    const brigade = await this.prisma.brigade.findFirst({
      where: { id: brigadeId, ownerId }
    });
    
    if (!brigade) {
      return { error: 'Brigade not found or unauthorized' };
    }
    
    await this.prisma.brigade.delete({
      where: { id: brigadeId }
    });
    
    return { success: true };
  }

  // --- Announcements ---
  async getPublicAnnouncements(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where: {
          status: 'PUBLISHED',
        },
        include: {
          company: {
            select: { id: true, name: true, email: true, phone: true, avatarUrl: true }
          }
        },
        orderBy: [
          { urgent: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.announcement.count({
        where: {
          status: 'PUBLISHED',
        }
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMyAnnouncements(companyId: string) {
    return this.prisma.announcement.findMany({
      where: { companyId },
      include: {
        company: {
          select: { id: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMyAnnouncement(companyId: string, data: any) {
    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const endDate = data.endDate ? new Date(data.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
    
    return this.prisma.announcement.create({
      data: {
        companyId,
        sphere: data.sphere,
        title: data.title,
        description: data.description,
        urgent: data.urgent || false,
        status: data.status || 'PENDING',
        startDate,
        endDate,
        imageUrls: data.imageUrls || [],
      },
    });
  }

  async updateMyAnnouncement(companyId: string, id: string, data: any) {
    const existing = await this.prisma.announcement.findUnique({ where: { id } });
    if (!existing || existing.companyId !== companyId) {
      throw new Error('Unauthorized or not found');
    }

    const updateData = { ...data };
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    let removedImages: string[] = [];
    if (data.imageUrls) {
      removedImages = existing.imageUrls.filter(url => !data.imageUrls.includes(url));
    }

    const updated = await this.prisma.announcement.update({
      where: { id },
      data: updateData,
    });
    
    return { ...updated, removedImages };
  }

  async deleteMyAnnouncement(companyId: string, id: string) {
    const existing = await this.prisma.announcement.findUnique({ where: { id } });
    if (!existing || existing.companyId !== companyId) {
      throw new Error('Unauthorized or not found');
    }

    const deleted = await this.prisma.announcement.delete({
      where: { id },
    });
    
    return { ...deleted, removedImages: existing.imageUrls || [] };
  }

  async updateBrigade(data: { ownerId: string; brigadeId: string; name: string; invites: string[]; removeMemberIds: string[] }) {
    const { ownerId, brigadeId, name, invites, removeMemberIds } = data;
    
    const brigade = await this.prisma.brigade.findFirst({
      where: { id: brigadeId, ownerId }
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
          OR: [{ email: invite }, { phone: invite }],
        },
      });

      if (!user || !user.roles.includes('MASTER')) {
        invalidInvites.push(invite);
      } else if (user.id === ownerId) {
        invalidInvites.push(invite + " (cannot invite yourself)");
      } else {
        const existingMember = await this.prisma.brigadeMember.findFirst({
          where: { brigadeId, userId: user.id }
        });
        if (!existingMember) {
          validUserIds.push(user.id);
        }
      }
    }

    if (invalidInvites.length > 0) {
      return { error: `Invalid invites: The following users were not found, are not masters, or are invalid: ${invalidInvites.join(', ')}` };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.brigade.update({
        where: { id: brigadeId },
        data: { name }
      });
      
      if (removeMemberIds && removeMemberIds.length > 0) {
        await tx.brigadeMember.deleteMany({
          where: {
            id: { in: removeMemberIds },
            brigadeId: brigadeId 
          }
        });
      }
      
      if (validUserIds.length > 0) {
        await tx.brigadeMember.createMany({
          data: validUserIds.map((userId) => ({
            brigadeId,
            userId,
            status: 'PENDING',
          }))
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
        }
      );
    }

    return this.prisma.brigade.findUnique({
      where: { id: brigadeId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
          }
        }
      }
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
      include: { owner: true }
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
        }
      );

      // Emit WS event directly to API Gateway to invalidate My Brigades cache
      this.notificationsService.emit(
        { cmd: 'send-ws-event' },
        {
          userId: brigade.ownerId,
          event: 'brigade_updated',
          payload: { brigadeId: brigade.id }
        }
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
      include: { owner: true }
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
        }
      );

      // Emit WS event directly to API Gateway to invalidate My Brigades cache
      this.notificationsService.emit(
        { cmd: 'send-ws-event' },
        {
          userId: brigade.ownerId,
          event: 'brigade_updated',
          payload: { brigadeId: brigade.id }
        }
      );
    }

    return { success: true };
  }
}
