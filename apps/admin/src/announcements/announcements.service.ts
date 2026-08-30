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

  async getAnnouncements() {
    return this.prisma.announcement.findMany({
      include: {
        company: {
          select: { id: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAnnouncement(data: {
    companyId: string;
    sphere: string;
    title: string;
    description: string;
    urgent: boolean;
    status?: any;
    startDate: Date;
    endDate: Date;
    imageUrls?: string[];
  }) {
    const created = await this.prisma.announcement.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        imageUrls: data.imageUrls || [],
      },
    });

    if (created.status === 'PUBLISHED') {
      this.notifyMastersOfAnnouncement(created);
    }

    return created;
  }

  async updateAnnouncement(id: string, data: any) {
    const existing = await this.prisma.announcement.findUnique({ where: { id } });
    if (!existing) throw new Error('Not found');

    const updateData = { ...data };
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    let removedImages: string[] = [];
    if (data.imageUrls) {
      removedImages = existing.imageUrls.filter((url: string) => !data.imageUrls.includes(url));
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

  async deleteAnnouncement(id: string) {
    const existing = await this.prisma.announcement.findUnique({ where: { id } });
    if (!existing) throw new Error('Not found');
    
    const deleted = await this.prisma.announcement.delete({
      where: { id },
    });
    
    return { ...deleted, removedImages: existing.imageUrls || [] };
  }
}
