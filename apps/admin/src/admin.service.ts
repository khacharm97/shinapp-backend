import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: any) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.roles.includes('ADMIN')) {
      throw new UnauthorizedException('Not an admin');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        name: user.name,
      }
    };
  }

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
      }
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
      select: { id: true, contact: true }
    });
    return record;
  }

  async markContactRequestAsRead(id: string) {
    return this.prisma.contactRequest.update({
      where: { id },
      data: { isRead: true }
    });
  }

  async getAllSkills() {
    return this.prisma.skill.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSkill(data: { key: string; nameEn: string; nameAm: string; nameRu: string; nameFa: string; icon?: string; approved: boolean }) {
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
