import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class MastersService {
  constructor(private prisma: PrismaService) {}

  async getMasters(
    page: number = 1,
    limit: number = 10,
    filters?: { search?: string; regionId?: string; cityId?: string; topRated?: boolean; availableNow?: boolean }
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      roles: {
        has: 'MASTER',
      },
      verifiedAt: {
        not: null,
      },
    };

    const AND: any[] = [];
    if (filters?.regionId) AND.push({ userInfo: { is: { regionId: filters.regionId } } });
    if (filters?.cityId) AND.push({ userInfo: { is: { cityId: filters.cityId } } });
    if (filters?.topRated) AND.push({ userInfo: { is: { topRated: filters.topRated } } });
    if (filters?.availableNow) AND.push({ userInfo: { is: { availableNow: filters.availableNow } } });

    if (filters?.search) {
      AND.push({
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { userInfo: { is: { skills: { has: filters.search } } } },
        ],
      });
    }

    if (AND.length > 0) {
      where.AND = AND;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { userInfo: true },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where,
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

  async globalSearch(
    page: number = 1,
    limit: number = 10,
    filters?: { search?: string; regionId?: string; cityId?: string; topRated?: boolean; availableNow?: boolean }
  ) {
    const mastersData = await this.getMasters(page, limit, filters);
    
    // Future: add queries for techniques, calculators, etc. here
    
    return {
      masters: mastersData,
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
