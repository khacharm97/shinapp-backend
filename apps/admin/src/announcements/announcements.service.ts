import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.announcement.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        imageUrls: data.imageUrls || [],
      },
    });
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
