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
  }) {
    return this.prisma.announcement.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
  }

  async updateAnnouncement(id: string, data: any) {
    const updateData = { ...data };
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    return this.prisma.announcement.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteAnnouncement(id: string) {
    return this.prisma.announcement.delete({
      where: { id },
    });
  }
}
