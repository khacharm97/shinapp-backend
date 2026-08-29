import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async getSkills(approvedOnly: boolean = true) {
    return this.prisma.skill.findMany({
      where: approvedOnly ? { approved: true } : undefined,
      orderBy: { nameEn: 'asc' },
    });
  }

  async suggestSkill(data: {
    key: string;
    nameEn: string;
    nameAm: string;
    nameRu: string;
    nameFa: string;
  }) {
    return this.prisma.skill.create({
      data: {
        ...data,
        approved: false,
      },
    });
  }
}
