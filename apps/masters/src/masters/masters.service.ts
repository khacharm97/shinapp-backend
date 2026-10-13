import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface MasterListFilters {
  search?: string;
  regionId?: string;
  cityId?: string;
  topRated?: boolean;
  availableNow?: boolean;
  sortBy?: 'rating';
}

interface MasterRating {
  rating: number;
  reviewsCount: number;
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

  /**
   * Aggregates the review scores each master has received.
   * Reviews were introduced after the search feature, so ratings are derived
   * on the fly from the Review table rather than stored on the user.
   */
  private async getRatingMap(
    masterIds: string[],
  ): Promise<Map<string, MasterRating>> {
    if (masterIds.length === 0) return new Map();
    const grouped = await this.prisma.review.groupBy({
      by: ['targetId'],
      where: { targetId: { in: masterIds } },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return new Map(
      grouped.map((g) => [
        g.targetId,
        { rating: g._avg.rating ?? 0, reviewsCount: g._count.rating },
      ]),
    );
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

    const include = {
      userInfo: true,
      ownedBrigades: true,
      brigadeMemberships: {
        where: { status: 'ACCEPTED' as const },
        include: { brigade: true },
      },
    };

    let items: any[];
    let total: number;

    if (filters?.sortBy === 'rating') {
      // Rating lives in a separate table, so we can't push the ordering into
      // the SQL query. Rank every matching master by their average score, then
      // slice out the requested page.
      const candidates = await this.prisma.user.findMany({
        where,
        select: { id: true },
      });
      total = candidates.length;

      const ratingMap = await this.getRatingMap(candidates.map((c) => c.id));
      const orderedIds = candidates
        .map((c) => c.id)
        .sort((a, b) => {
          const ra = ratingMap.get(a) ?? { rating: 0, reviewsCount: 0 };
          const rb = ratingMap.get(b) ?? { rating: 0, reviewsCount: 0 };
          if (rb.rating !== ra.rating) return rb.rating - ra.rating;
          return rb.reviewsCount - ra.reviewsCount;
        });

      const pageIds = orderedIds.slice(skip, skip + limit);
      const unordered = await this.prisma.user.findMany({
        where: { id: { in: pageIds } },
        include,
      });
      const byId = new Map(unordered.map((u) => [u.id, u]));
      items = pageIds.map((id) => byId.get(id)).filter(Boolean) as any[];
    } else {
      [items, total] = await Promise.all([
        this.prisma.user.findMany({ where, include, skip, take: limit }),
        this.prisma.user.count({ where }),
      ]);
    }

    // Sanitize output + attach live availability status and review scores
    const busyMasterIds = await this.getMastersWithCurrentJob(
      items.map((i) => i.id),
    );
    const ratingMap = await this.getRatingMap(items.map((i) => i.id));
    const sanitizedItems = items.map(({ password, ...rest }) => ({
      ...rest,
      availability: this.resolveAvailability(
        busyMasterIds.has(rest.id),
        rest.userInfo?.multipleJobs,
      ),
      rating: ratingMap.get(rest.id)?.rating ?? 0,
      reviewsCount: ratingMap.get(rest.id)?.reviewsCount ?? 0,
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
    return this.getPublicUserById(id, { requireMaster: true });
  }

  /**
   * Public profile of any user - master, company or plain client. Only the
   * fields listed here leave the server: contact details (email, phone) and
   * account internals are deliberately never selected.
   */
  async getPublicUserById(id: string, opts?: { requireMaster?: boolean }) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        isBlocked: false,
        isGuest: false,
        NOT: { roles: { has: 'ADMIN' } },
        ...(opts?.requireMaster ? { roles: { has: 'MASTER' } } : {}),
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        roles: true,
        verifiedAt: true,
        createdAt: true,
        userInfo: {
          select: {
            regionId: true,
            cityId: true,
            skills: true,
            largeScale: true,
            urgentOrders: true,
            onlinePay: true,
            buyMaterial: true,
            nightShift: true,
            multipleJobs: true,
            topRated: true,
            availableNow: true,
            pricingFormat: true,
            priceValue: true,
            about: true,
            website: true,
            socialFacebook: true,
            socialInstagram: true,
            socialTiktok: true,
            workingPlaces: true,
            workersCount: true,
          },
        },
        portfolios: {
          orderBy: { order: 'asc' },
        },
        brigadeMemberships: {
          where: { status: 'ACCEPTED' },
          include: { brigade: true },
        },
        ownedBrigades: true,
        techniques: {
          orderBy: { createdAt: 'desc' },
        },
        announcements: {
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            sphere: true,
            urgent: true,
            startDate: true,
            endDate: true,
            imageUrls: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(
        opts?.requireMaster ? 'Master not found' : 'User not found',
      );
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
      user.userInfo?.multipleJobs,
    );

    return { ...user, stats, availability };
  }
}
