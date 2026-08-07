import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class MastersService {
  constructor(private prisma: PrismaService) {}

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
}
