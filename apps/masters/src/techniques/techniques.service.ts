import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface TechniqueListFilters {
  search?: string;
}

const OWNER_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
  phone: true,
  userInfo: { select: { regionId: true, cityId: true } },
};

@Injectable()
export class TechniquesService {
  constructor(private prisma: PrismaService) {}

  async getTechniques(
    page: number = 1,
    limit: number = 10,
    filters?: TechniqueListFilters,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.technique.findMany({
        where,
        include: { owner: { select: OWNER_SELECT } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.technique.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTechniqueById(id: string) {
    const technique = await this.prisma.technique.findUnique({
      where: { id },
      include: { owner: { select: OWNER_SELECT } },
    });

    if (!technique) return { error: 'Technique not found' };
    return technique;
  }

  async getMyTechniques(ownerId: string) {
    return this.prisma.technique.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTechnique(ownerId: string, data: any) {
    return this.prisma.technique.create({
      data: {
        ownerId,
        name: data.name,
        description: data.description || null,
        imageUrls: data.imageUrls || [],
        priceType: data.priceType === 'FIXED' ? 'FIXED' : 'HOURLY',
        price: Number(data.price),
      },
    });
  }

  async updateTechnique(ownerId: string, id: string, data: any) {
    const existing = await this.prisma.technique.findUnique({ where: { id } });
    if (!existing || existing.ownerId !== ownerId) {
      return { error: 'Unauthorized or not found' };
    }

    let removedImages: string[] = [];
    if (data.imageUrls) {
      removedImages = existing.imageUrls.filter(
        (url) => !data.imageUrls.includes(url),
      );
    }

    const updated = await this.prisma.technique.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.imageUrls !== undefined
          ? { imageUrls: data.imageUrls }
          : {}),
        ...(data.priceType !== undefined
          ? { priceType: data.priceType === 'FIXED' ? 'FIXED' : 'HOURLY' }
          : {}),
        ...(data.price !== undefined ? { price: Number(data.price) } : {}),
      },
    });

    return { ...updated, removedImages };
  }

  async deleteTechnique(ownerId: string, id: string) {
    const existing = await this.prisma.technique.findUnique({ where: { id } });
    if (!existing || existing.ownerId !== ownerId) {
      return { error: 'Unauthorized or not found' };
    }

    const deleted = await this.prisma.technique.delete({ where: { id } });
    return { ...deleted, removedImages: existing.imageUrls || [] };
  }

  async getBusyDatesForTechnique(techniqueId: string) {
    return this.prisma.order.findMany({
      where: {
        techniqueId,
        status: { in: ['ACCEPTED', 'COMPLETION_REQUESTED'] },
      },
      select: { startDate: true, endDate: true },
    });
  }
}
