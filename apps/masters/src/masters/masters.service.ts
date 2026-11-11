import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface MasterListFilters {
  search?: string;
  regionId?: string;
  cityId?: string;
  topRated?: boolean;
  availableNow?: boolean;
  sortBy?: 'rating';
  /** Skill keys - a master matches if they have any of them. */
  skills?: string[];
  minRating?: number;
  maxRating?: number;
  /** Price filter only applies within one pricing unit (per day or per m2). */
  priceUnit?: 'daily' | 'sqm';
  minPrice?: number;
  maxPrice?: number;
}

interface MasterRating {
  rating: number;
  reviewsCount: number;
}

export type MasterAvailability = 'AVAILABLE' | 'HALF_BUSY' | 'BUSY';

// "Top rated" is earned from reviews. The website shows the badge with the
// same rule (shinapp/src/utils isTopRated) - keep the two in step.
const TOP_RATED_MIN_RATING = 4.5;
const TOP_RATED_MIN_REVIEWS = 1;

@Injectable()
export class MastersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Who is busy today, using the same sources as the master's calendar
   * (OrdersService.getBusyDatesForMaster):
   * - withJob: an accepted order today, their own or a brigade order they're assigned to
   * - blocked: a day they marked busy themselves (vacation, outside work...)
   * Pass masterIds to check only those masters; leave it out to check everyone.
   */
  private async getBusyToday(
    masterIds?: string[],
  ): Promise<{ withJob: Set<string>; blocked: Set<string> }> {
    if (masterIds && masterIds.length === 0)
      return { withJob: new Set(), blocked: new Set() };

    // Order and busy dates are stored as whole days, so compare by day: a job
    // ending today still counts all day long.
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCHours(23, 59, 59, 999);
    const coversToday = { startDate: { lte: dayEnd }, endDate: { gte: dayStart } };
    const activeOrder = { status: { in: ['ACCEPTED', 'COMPLETION_REQUESTED'] as any } };
    const only = (field: string) => (masterIds ? { [field]: { in: masterIds } } : {});

    const [ownOrders, assignments, busyPeriods] = await Promise.all([
      this.prisma.order.findMany({
        where: { ...only('masterId'), ...activeOrder, ...coversToday },
        select: { masterId: true },
      }),
      this.prisma.orderAssignment.findMany({
        where: { ...only('memberId'), order: { ...activeOrder, ...coversToday } },
        select: { memberId: true },
      }),
      this.prisma.busyPeriod.findMany({
        where: { ...only('masterId'), ...coversToday },
        select: { masterId: true },
      }),
    ]);

    return {
      withJob: new Set([
        ...ownOrders.map((o) => o.masterId),
        ...assignments.map((a) => a.memberId),
      ]),
      blocked: new Set(busyPeriods.map((b) => b.masterId)),
    };
  }

  private resolveAvailability(
    id: string,
    busy: { withJob: Set<string>; blocked: Set<string> },
    multipleJobs?: boolean | null,
  ): MasterAvailability {
    // A day they marked busy themselves means fully busy.
    if (busy.blocked.has(id)) return 'BUSY';
    if (!busy.withJob.has(id)) return 'AVAILABLE';
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

  /** Ids of users whose reviews meet the "top rated" bar. */
  private async getTopRatedIds(): Promise<string[]> {
    const grouped = await this.prisma.review.groupBy({
      by: ['targetId'],
      _count: { rating: true },
      having: {
        rating: {
          _avg: { gte: TOP_RATED_MIN_RATING },
          _count: { gte: TOP_RATED_MIN_REVIEWS },
        },
      },
    });
    return grouped.map((g) => g.targetId);
  }

  /**
   * Turns a rating range into a Prisma condition on user id. Masters with no
   * reviews count as rating 0, so they only pass when the range starts at 0.
   */
  private async getRatingRangeCondition(
    min?: number,
    max?: number,
  ): Promise<any | null> {
    const lo = min ?? 0;
    const hi = max ?? 5;
    if (lo <= 0 && hi >= 5) return null;

    const grouped = await this.prisma.review.groupBy({
      by: ['targetId'],
      _avg: { rating: true },
    });
    const inRange = (avg: number) => avg >= lo && avg <= hi;

    if (lo <= 0) {
      // Unrated masters are in range - exclude only the rated ones outside it.
      const outside = grouped
        .filter((g) => !inRange(g._avg.rating ?? 0))
        .map((g) => g.targetId);
      return { id: { notIn: outside } };
    }
    const inside = grouped
      .filter((g) => inRange(g._avg.rating ?? 0))
      .map((g) => g.targetId);
    return { id: { in: inside } };
  }

  /**
   * Ids of masters whose price in the given unit falls in [min, max].
   * priceValue is stored as free text, so it's parsed here rather than in SQL.
   */
  private async getPriceRangeIds(
    unit: 'daily' | 'sqm',
    min?: number,
    max?: number,
  ): Promise<string[]> {
    const rows = await this.prisma.userInfo.findMany({
      where: { pricingFormat: unit, priceValue: { not: null } },
      select: { userId: true, priceValue: true },
    });
    return rows
      .filter((r) => {
        const digits = (r.priceValue ?? '').replace(/[^\d.]/g, '');
        if (!digits) return false;
        const price = Number(digits);
        if (!Number.isFinite(price)) return false;
        if (min !== undefined && price < min) return false;
        if (max !== undefined && price > max) return false;
        return true;
      })
      .map((r) => r.userId);
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
      AND.push({ id: { in: await this.getTopRatedIds() } });
    if (filters?.skills?.length)
      AND.push({ userInfo: { is: { skills: { hasSome: filters.skills } } } });
    const ratingCondition = await this.getRatingRangeCondition(
      filters?.minRating,
      filters?.maxRating,
    );
    if (ratingCondition) AND.push(ratingCondition);
    if (
      filters?.priceUnit &&
      (filters.minPrice !== undefined || filters.maxPrice !== undefined)
    ) {
      AND.push({
        id: {
          in: await this.getPriceRangeIds(
            filters.priceUnit,
            filters.minPrice,
            filters.maxPrice,
          ),
        },
      });
    }
    if (filters?.availableNow) {
      // Can take work today: "Available now" or "Partially busy" on their card.
      // Out: marked today busy themselves, or on a job and only take one at a time.
      const busy = await this.getBusyToday();
      AND.push({ id: { notIn: [...busy.blocked] } });
      AND.push({
        OR: [
          { id: { notIn: [...busy.withJob] } },
          { userInfo: { is: { multipleJobs: true } } },
        ],
      });
    }

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
    const busy = await this.getBusyToday(items.map((i) => i.id));
    const ratingMap = await this.getRatingMap(items.map((i) => i.id));
    const sanitizedItems = items.map(({ password, ...rest }) => ({
      ...rest,
      availability: this.resolveAvailability(
        rest.id,
        busy,
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

    const availability = this.resolveAvailability(
      id,
      await this.getBusyToday([id]),
      user.userInfo?.multipleJobs,
    );

    return { ...user, stats, availability };
  }
}
