import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async getAllSkills() {
    return this.prisma.skill.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSkill(data: {
    key: string;
    nameEn: string;
    nameAm: string;
    nameRu: string;
    nameFa: string;
    icon?: string;
    color?: string | null;
    approved: boolean;
  }) {
    return this.prisma.skill.create({
      data,
    });
  }

  async updateSkill(id: string, data: any) {
    return this.prisma.skill.update({
      where: { id },
      data,
    });
  }

  async deleteSkill(id: string) {
    return this.prisma.skill.delete({
      where: { id },
    });
  }
}
