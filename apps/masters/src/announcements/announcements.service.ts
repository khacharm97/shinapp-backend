import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async getPublicAnnouncements(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where: {
          status: 'PUBLISHED',
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: [{ urgent: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.announcement.count({
        where: {
          status: 'PUBLISHED',
        },
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
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMyAnnouncement(companyId: string, data: any) {
    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const endDate = data.endDate
      ? new Date(data.endDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

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
    const existing = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!existing || existing.companyId !== companyId) {
      throw new Error('Unauthorized or not found');
    }

    const updateData = { ...data };
    if (updateData.startDate)
      updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    let removedImages: string[] = [];
    if (data.imageUrls) {
      removedImages = existing.imageUrls.filter(
        (url) => !data.imageUrls.includes(url),
      );
    }

    const updated = await this.prisma.announcement.update({
      where: { id },
      data: updateData,
    });

    return { ...updated, removedImages };
  }

  async deleteMyAnnouncement(companyId: string, id: string) {
    const existing = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!existing || existing.companyId !== companyId) {
      throw new Error('Unauthorized or not found');
    }

    const deleted = await this.prisma.announcement.delete({
      where: { id },
    });

    return { ...deleted, removedImages: existing.imageUrls || [] };
  }
}
