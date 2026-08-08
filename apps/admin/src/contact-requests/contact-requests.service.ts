import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactRequestsService {
  constructor(private prisma: PrismaService) {}

  async getContactRequests() {
    return this.prisma.contactRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createContactRequest(data: any) {
    return this.prisma.contactRequest.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        notes: data.notes,
        contact: data.contact,
        isRead: false,
      },
    });
  }

  async updateContactRequest(email: string, data: any) {
    return this.prisma.contactRequest.updateMany({
      where: { email },
      data,
    });
  }

  async contactRequestExists(email: string) {
    const record = await this.prisma.contactRequest.findFirst({
      where: { email },
      select: { id: true, contact: true },
    });
    return record;
  }

  async markContactRequestAsRead(id: string) {
    return this.prisma.contactRequest.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
