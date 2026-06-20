import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class MastersService {
  constructor(private prisma: PrismaService) {}

  async getMasters(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          roles: {
            has: 'MASTER',
          },
          verifiedAt: {
            not: null,
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
          verifiedAt: {
            not: null,
          },
        },
      }),
    ]);

    // Sanitize output
    const sanitizedItems = items.map(({ password, ...rest }) => rest);

    return {
      items: sanitizedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMasterById(id: string) {
    const master = await this.prisma.user.findUnique({
      where: {
        id,
        roles: {
          has: 'MASTER',
        },
      },
      include: { userInfo: true },
    });

    if (!master) {
      throw new NotFoundException('Master not found');
    }

    const { password, ...sanitizedMaster } = master;
    return sanitizedMaster;
  }
}
