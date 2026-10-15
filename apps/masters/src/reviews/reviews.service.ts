import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_REVIEW_IMAGES = 3;

const reviewInclude = {
  author: { select: { id: true, name: true, avatarUrl: true } },
  target: { select: { id: true, name: true, avatarUrl: true } },
} as const;

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(data: { orderId: string; authorId: string; targetId: string; rating: number; comment?: string; images?: string[] }) {
    const { orderId, authorId, targetId, rating, comment } = data;

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { error: 'review_order_not_found' };
    if (order.status !== 'COMPLETED') return { error: 'review_order_not_completed' };

    // Only the two contracting parties may review, and each reviews the other.
    const isClient = authorId === order.clientId;
    const isMaster = authorId === order.masterId;
    if (!isClient && !isMaster) return { error: 'review_not_order_party' };
    if (targetId !== (isClient ? order.masterId : order.clientId)) {
      return { error: 'review_invalid_target' };
    }

    const existing = await this.prisma.review.findFirst({
      where: { orderId, authorId }
    });

    if (existing) {
      return { error: 'review_already_exists' };
    }

    const review = await this.prisma.review.create({
      data: {
        orderId,
        authorId,
        targetId,
        rating,
        comment,
        images: (data.images || []).slice(0, MAX_REVIEW_IMAGES),
      }
    });

    return review;
  }

  async getReviewsForMaster(masterId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { targetId: masterId },
      include: reviewInclude,
      orderBy: { createdAt: 'desc' }
    });

    return this.withAverage(await this.withTargetImages(reviews));
  }

  /**
   * Reviews received by the brigade's owner and accepted members for work they
   * did as the contractor - reviews they got as a client elsewhere are left out.
   */
  async getReviewsForBrigade(brigadeId: string) {
    const brigade = await this.prisma.brigade.findUnique({
      where: { id: brigadeId },
      select: {
        ownerId: true,
        members: { where: { status: 'ACCEPTED' }, select: { userId: true } },
      },
    });
    if (!brigade) return { reviews: [], averageRating: 0, count: 0 };

    const memberIds = [brigade.ownerId, ...brigade.members.map((m) => m.userId)];

    const reviews = await this.prisma.review.findMany({
      where: { targetId: { in: memberIds } },
      include: {
        ...reviewInclude,
        order: { select: { masterId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.withAverage(
      await this.withTargetImages(
        reviews
          .filter((r) => r.order.masterId === r.targetId)
          .map(({ order: _order, ...review }) => review),
      ),
    );
  }

  /**
   * Reviews clients left on orders that booked this technique - the owner's
   * reviews of those clients are left out.
   */
  async getReviewsForTechnique(techniqueId: string) {
    const technique = await this.prisma.technique.findUnique({
      where: { id: techniqueId },
      select: { ownerId: true },
    });
    if (!technique) return { reviews: [], averageRating: 0, count: 0 };

    const reviews = await this.prisma.review.findMany({
      where: { targetId: technique.ownerId, order: { techniqueId } },
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });

    return this.withAverage(await this.withTargetImages(reviews));
  }

  /**
   * Adds `targetImages`: the photos the reviewed person attached to their own
   * review of the same order, so e.g. a master's work photos show under the
   * client's review even when the client added none. Nothing is copied - both
   * reviews keep their own images.
   */
  private async withTargetImages<T extends { orderId: string; targetId: string }>(reviews: T[]) {
    if (reviews.length === 0) return [];

    const counterparts = await this.prisma.review.findMany({
      where: {
        OR: reviews.map((r) => ({ orderId: r.orderId, authorId: r.targetId })),
        NOT: { images: { isEmpty: true } },
      },
      select: { orderId: true, authorId: true, images: true },
    });
    const imagesByKey = new Map(counterparts.map((c) => [`${c.orderId}:${c.authorId}`, c.images]));

    return reviews.map((r) => ({
      ...r,
      targetImages: imagesByKey.get(`${r.orderId}:${r.targetId}`) ?? [],
    }));
  }

  private withAverage<T extends { rating: number }>(reviews: T[]) {
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return { reviews, averageRating, count: reviews.length };
  }
}
