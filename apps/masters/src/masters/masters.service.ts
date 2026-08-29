import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface MasterListFilters {
  search?: string;
  regionId?: string;
  cityId?: string;
  topRated?: boolean;
  availableNow?: boolean;
}

export type MasterAvailability = 'AVAILABLE' | 'HALF_BUSY' | 'BUSY';

@Injectable()
export class MastersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns the set of master ids that have a job in progress right now
   * (an ACCEPTED / COMPLETION_REQUESTED order whose date range covers today).
   */
  private async getMastersWithCurrentJob(
    masterIds: string[],
  ): Promise<Set<string>> {
    if (masterIds.length === 0) return new Set();
    const now = new Date();
    const ongoing = await this.prisma.order.findMany({
      where: {
        masterId: { in: masterIds },
        status: { in: ['ACCEPTED', 'COMPLETION_REQUESTED'] },
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: { masterId: true },
    });
    return new Set(ongoing.map((o) => o.masterId));
  }

  private resolveAvailability(
    hasCurrentJob: boolean,
    multipleJobs?: boolean | null,
  ): MasterAvailability {
    if (!hasCurrentJob) return 'AVAILABLE';
    return multipleJobs ? 'HALF_BUSY' : 'BUSY';
  }

  async getMasters(
    page: number = 1,
    limit: number = 10,
    filters?: MasterListFilters,
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
        include: {
          userInfo: true,
          ownedBrigades: true,
          brigadeMemberships: {
            where: { status: 'ACCEPTED' },
            include: { brigade: true }
          }
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where,
      }),
    ]);

    // Sanitize output + attach live availability status
    const busyMasterIds = await this.getMastersWithCurrentJob(
      items.map((i) => i.id),
    );
    const sanitizedItems = items.map(({ password, ...rest }) => ({
      ...rest,
      availability: this.resolveAvailability(
        busyMasterIds.has(rest.id),
        rest.userInfo?.multipleJobs,
      ),
    }));

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
    filters?: MasterListFilters,
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
        brigadeMemberships: {
          where: { status: 'ACCEPTED' },
          include: { brigade: true },
        },
        ownedBrigades: true,
      },
    });

    if (!master) {
      throw new NotFoundException('Master not found');
    }

    // Derive public stats from completed orders where this user was the master.
    const completedOrders = await this.prisma.order.findMany({
      where: { masterId: id, status: 'COMPLETED' },
      select: { clientId: true },
    });
    const stats = {
      totalJobs: completedOrders.length,
      customers: new Set(completedOrders.map((o) => o.clientId)).size,
    };

    const busyMasterIds = await this.getMastersWithCurrentJob([id]);
    const availability = this.resolveAvailability(
      busyMasterIds.has(id),
      master.userInfo?.multipleJobs,
    );

    const { password, ...sanitizedMaster } = master;
    return { ...sanitizedMaster, stats, availability };
  }
}
