import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    private prisma: PrismaService,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsService: ClientProxy,
  ) {}

  /** Tell the notifications service to fan out to every active master. */
  private notifyMastersOfAnnouncement(announcement: {
    id: string;
    title: string;
    sphere?: string;
  }) {
    this.notificationsService.emit(
      { cmd: 'notify-masters-new-announcement' },
      {
        announcementId: announcement.id,
        title: announcement.title,
        sphere: announcement.sphere,
      },
    );
  }

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

  async getPublicAnnouncementById(id: string) {
    const announcement = await this.prisma.announcement.findFirst({
      where: { id, status: 'PUBLISHED' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
            verifiedAt: true,
            userInfo: {
              select: {
                about: true,
                website: true,
                regionId: true,
                cityId: true,
                socialFacebook: true,
                socialInstagram: true,
                socialTiktok: true,
                itn: true,
                workersCount: true,
                workingPlaces: true,
              },
            },
          },
        },
      },
    });

    if (!announcement) return { error: 'Announcement not found' };

    const companyAnnouncementsCount = await this.prisma.announcement.count({
      where: { companyId: announcement.companyId, status: 'PUBLISHED' },
    });

    return { ...announcement, companyAnnouncementsCount };
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

    const created = await this.prisma.announcement.create({
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

    if (created.status === 'PUBLISHED') {
      this.notifyMastersOfAnnouncement(created);
    }

    return created;
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

    // Fire only on the transition into PUBLISHED, not on every edit of an
    // already-live announcement.
    if (existing.status !== 'PUBLISHED' && updated.status === 'PUBLISHED') {
      this.notifyMastersOfAnnouncement(updated);
    }

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
