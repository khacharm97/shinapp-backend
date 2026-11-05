import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface TechniqueListFilters {
  search?: string;
  sortBy?: 'rating';
}

const OWNER_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
  phone: true,
  userInfo: { select: { regionId: true, cityId: true } },
};

@Injectable()
export class TechniquesService {
  constructor(private prisma: PrismaService) {}

  async getTechniques(
    page: number = 1,
    limit: number = 10,
    filters?: TechniqueListFilters,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const include = { owner: { select: OWNER_SELECT } };
    let items: any[];
    let total: number;

    if (filters?.sortBy === 'rating') {
      // Ratings come from reviews, so they can't be ordered in SQL. Rank every
      // matching technique by average score, then slice out the page.
      const candidates = await this.prisma.technique.findMany({
        where,
        select: { id: true, ownerId: true, createdAt: true },
      });
      total = candidates.length;

      const ratingMap = await this.getRatingMap(candidates);
      const pageIds = candidates
        .sort((a, b) => {
          const ra = ratingMap.get(a.id) ?? { rating: 0, reviewsCount: 0 };
          const rb = ratingMap.get(b.id) ?? { rating: 0, reviewsCount: 0 };
          if (rb.rating !== ra.rating) return rb.rating - ra.rating;
          if (rb.reviewsCount !== ra.reviewsCount) return rb.reviewsCount - ra.reviewsCount;
          return b.createdAt.getTime() - a.createdAt.getTime();
        })
        .slice(skip, skip + limit)
        .map((c) => c.id);

      const unordered = await this.prisma.technique.findMany({
        where: { id: { in: pageIds } },
        include,
      });
      const byId = new Map(unordered.map((t) => [t.id, t]));
      items = pageIds.map((id) => byId.get(id)).filter(Boolean);
    } else {
      [items, total] = await Promise.all([
        this.prisma.technique.findMany({
          where,
          include,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.technique.count({ where }),
      ]);
    }

    const ratingMap = await this.getRatingMap(items);
    const withRatings = items.map((t) => ({
      ...t,
      rating: ratingMap.get(t.id)?.rating ?? 0,
      reviewsCount: ratingMap.get(t.id)?.reviewsCount ?? 0,
    }));

    return {
      items: withRatings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Average rating per technique, counting the same reviews as the technique
   * page: ones written about the owner on orders that booked the technique.
   */
  private async getRatingMap(techniques: { id: string; ownerId: string }[]) {
    const map = new Map<string, { rating: number; reviewsCount: number }>();
    if (techniques.length === 0) return map;

    const ownerById = new Map(techniques.map((t) => [t.id, t.ownerId]));
    const reviews = await this.prisma.review.findMany({
      where: { order: { techniqueId: { in: [...ownerById.keys()] } } },
      select: { rating: true, targetId: true, order: { select: { techniqueId: true } } },
    });

    const sums = new Map<string, { sum: number; count: number }>();
    for (const r of reviews) {
      const techniqueId = r.order.techniqueId;
      if (!techniqueId || ownerById.get(techniqueId) !== r.targetId) continue;
      const s = sums.get(techniqueId) ?? { sum: 0, count: 0 };
      s.sum += r.rating;
      s.count += 1;
      sums.set(techniqueId, s);
    }
    for (const [id, s] of sums) {
      map.set(id, { rating: s.sum / s.count, reviewsCount: s.count });
    }
    return map;
  }

  async getTechniqueById(id: string) {
    const technique = await this.prisma.technique.findUnique({
      where: { id },
      include: { owner: { select: OWNER_SELECT } },
    });

    if (!technique) return { error: 'Technique not found' };
    return technique;
  }

  async getMyTechniques(ownerId: string) {
    return this.prisma.technique.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTechnique(ownerId: string, data: any) {
    return this.prisma.technique.create({
      data: {
        ownerId,
        name: data.name,
        description: data.description || null,
        imageUrls: data.imageUrls || [],
        priceType: data.priceType === 'FIXED' ? 'FIXED' : 'HOURLY',
        price: Number(data.price),
      },
    });
  }

  async updateTechnique(ownerId: string, id: string, data: any) {
    const existing = await this.prisma.technique.findUnique({ where: { id } });
    if (!existing || existing.ownerId !== ownerId) {
      return { error: 'Unauthorized or not found' };
    }

    let removedImages: string[] = [];
    if (data.imageUrls) {
      removedImages = existing.imageUrls.filter(
        (url) => !data.imageUrls.includes(url),
      );
    }

    const updated = await this.prisma.technique.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.imageUrls !== undefined
          ? { imageUrls: data.imageUrls }
          : {}),
        ...(data.priceType !== undefined
          ? { priceType: data.priceType === 'FIXED' ? 'FIXED' : 'HOURLY' }
          : {}),
        ...(data.price !== undefined ? { price: Number(data.price) } : {}),
      },
    });

    return { ...updated, removedImages };
  }

  async deleteTechnique(ownerId: string, id: string) {
    const existing = await this.prisma.technique.findUnique({ where: { id } });
    if (!existing || existing.ownerId !== ownerId) {
      return { error: 'Unauthorized or not found' };
    }

    const deleted = await this.prisma.technique.delete({ where: { id } });
    return { ...deleted, removedImages: existing.imageUrls || [] };
  }

  async getBusyDatesForTechnique(techniqueId: string) {
    return this.prisma.order.findMany({
      where: {
        techniqueId,
        status: { in: ['ACCEPTED', 'COMPLETION_REQUESTED'] },
      },
      select: { startDate: true, endDate: true },
    });
  }
}
