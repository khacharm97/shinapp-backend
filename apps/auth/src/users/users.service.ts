import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByIdentifier(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      include: { userInfo: true },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ 
      data,
      include: { userInfo: true },
    });
  }

  async getUserProfile(userId: string) {
    console.log('getUserProfile called with userId:', userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        userInfo: true,
      },
    });
    console.log('getUserProfile result:', user);
    return user;
  }

  async findMasters(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          roles: {
            has: 'MASTER',
          },
        },
        include: { userInfo: true },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: {
          roles: {
            has: 'MASTER',
          },
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

  async upsertUserInfo(userId: string, data: any) {
    const { name, phone, email, ...userInfoData } = data;

    // Update User core fields if provided
    if (name !== undefined || phone !== undefined || email !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
        },
      });
    }

    // Upsert UserInfo fields
    return this.prisma.userInfo.upsert({
      where: { userId },
      update: userInfoData,
      create: {
        ...userInfoData,
        userId,
      },
    });
  }
}
