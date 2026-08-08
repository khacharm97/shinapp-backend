import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        createdAt: true,
        isBlocked: true,
        verifiedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        userInfo: true,
        portfolios: true,
      },
    });
  }

  async toggleBlockUser(id: string, isBlocked: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isBlocked },
    });
  }

  async toggleVerifyUser(id: string, isVerified: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { verifiedAt: isVerified ? new Date() : null },
    });
  }
}
