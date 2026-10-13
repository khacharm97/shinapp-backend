import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

// Views from the same viewer only count once per calendar day (UTC). This
// keeps repeat visits from a genuine returning viewer contributing over
// time, while a page refreshed in a loop doesn't inflate the count.
const VIEW_DEDUPE_SALT = process.env.VIEW_HASH_SALT || 'shinapp-view-salt';

@Injectable()
export class AnnouncementsService {
  constructor(
    private prisma: PrismaService,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsService: ClientProxy,
  ) {}

  /**
   * Builds the de-dup key for a view. A logged-in user is identified by
   * their id regardless of IP/device; an anonymous visitor is identified by
   * a salted hash of IP + User-Agent so we never store raw IPs.
   */
  private buildViewerKey(userId?: string | null, ip?: string, userAgent?: string): string {
    if (userId) return `user:${userId}`;
    const fingerprint = createHmac('sha256', VIEW_DEDUPE_SALT)
      .update(`${ip || 'unknown'}|${userAgent || 'unknown'}`)
      .digest('hex');
    return `ip:${fingerprint}`;
  }

  /**
   * Records a view and bumps the denormalized counter, unless this viewer
   * already viewed this announcement today. Never throws: a failure here
   * (e.g. a race on the unique constraint) must not break page loads.
   */
  async recordAnnouncementView(
    id: string,
    opts: { userId?: string | null; ip?: string; userAgent?: string },
  ) {
    try {
      const viewerKey = this.buildViewerKey(opts.userId, opts.ip, opts.userAgent);
      const now = new Date();
      const viewDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

      await this.prisma.announcementView.create({
        data: { announcementId: id, viewerKey, viewDate },
      });

      await this.prisma.announcement.update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      });
    } catch (e: any) {
      // Unique constraint violation (P2002) just means "already viewed today" -
      // that's the expected dedupe path, not an error.
      if (e?.code !== 'P2002') {
        console.error('Failed to record announcement view', e);
      }
    }
  }

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
              verifiedAt: true,
              userInfo: {
                select: {
                  regionId: true,
                  cityId: true,
                },
              },
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

    // Only copy the fields a company may edit; anything else in the request
    // (companyId, viewsCount, ...) must never reach the update.
    const updateData: any = {};
    for (const field of [
      'sphere',
      'title',
      'description',
      'urgent',
      'status',
      'imageUrls',
    ]) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

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
