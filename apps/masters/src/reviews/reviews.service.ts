import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_REVIEW_IMAGES = 3;

const reviewInclude = {
  author: { select: { id: true, name: true, avatarUrl: true } },
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

    return this.withAverage(reviews);
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
        target: { select: { id: true, name: true, avatarUrl: true } },
        order: { select: { masterId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.withAverage(
      reviews
        .filter((r) => r.order.masterId === r.targetId)
        .map(({ order: _order, ...review }) => review),
    );
  }

  private withAverage<T extends { rating: number }>(reviews: T[]) {
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return { reviews, averageRating, count: reviews.length };
  }
}
