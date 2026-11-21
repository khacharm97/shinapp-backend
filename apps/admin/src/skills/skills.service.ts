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

  // Update/delete also report `orphanedIcon`: the previous icon value when it's
  // no longer used by any skill, so the gateway can remove the uploaded file
  // from storage. Non-URL values (Lucide names) are never reported.
  async updateSkill(id: string, data: any) {
    const previous = await this.prisma.skill.findUnique({
      where: { id },
      select: { icon: true },
    });
    const skill = await this.prisma.skill.update({
      where: { id },
      data,
    });
    const orphanedIcon =
      previous?.icon && previous.icon !== skill.icon
        ? await this.unusedIconUrl(previous.icon)
        : null;
    return { skill, orphanedIcon };
  }

  async deleteSkill(id: string) {
    const skill = await this.prisma.skill.delete({
      where: { id },
    });
    const orphanedIcon = skill.icon ? await this.unusedIconUrl(skill.icon) : null;
    return { skill, orphanedIcon };
  }

  async isIconUsed(icon: string): Promise<boolean> {
    return (await this.prisma.skill.count({ where: { icon } })) > 0;
  }

  private async unusedIconUrl(icon: string): Promise<string | null> {
    if (!/^https?:\/\//.test(icon)) return null;
    const stillUsed = await this.prisma.skill.count({ where: { icon } });
    return stillUsed === 0 ? icon : null;
  }
}
