import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(data: { orderId: string; authorId: string; targetId: string; rating: number; comment?: string }) {
    const { orderId, authorId, targetId, rating, comment } = data;

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { error: 'review_order_not_found' };
    if (order.status !== 'COMPLETED') return { error: 'review_order_not_completed' };

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
        comment
      }
    });

    return review;
  }

  async getReviewsForMaster(masterId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { targetId: masterId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return { reviews, averageRating, count: reviews.length };
  }
}
