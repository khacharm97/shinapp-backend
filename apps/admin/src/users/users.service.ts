import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

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

  async createUser(data: any) {
    // Check for existing user
    if (data.email) {
      const existingEmail = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) {
        throw new BadRequestException('User with this email already exists');
      }
    }
    if (data.phone) {
      const existingPhone = await this.prisma.user.findUnique({ where: { phone: data.phone } });
      if (existingPhone) {
        throw new BadRequestException('User with this phone already exists');
      }
    }

    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    
    // Map role string to Role enum array
    let roles: Role[] = [Role.USER];
    if (data.role === 'MASTER') roles = [Role.MASTER];
    else if (data.role === 'COMPANY') roles = [Role.COMPANY];
    else if (data.role === 'ADMIN') roles = [Role.ADMIN];

    const isMasterOrCompany = roles.includes(Role.MASTER) || roles.includes(Role.COMPANY);

    // Build user info data if needed
    let userInfoCreate: any = undefined;
    if (isMasterOrCompany) {
      userInfoCreate = {
        skills: data.skills || [],
        pricingFormat: data.pricingFormat || null,
        priceValue: data.priceValue || null,
        about: data.about || null,
        itn: data.itn || null,
        workersCount: data.workersCount ? parseInt(data.workersCount, 10) : null,
        website: data.website || null,
      };
    }

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        password: hashedPassword,
        roles: roles,
        verifiedAt: new Date(), // Auto-verify users created by admin
        userInfo: userInfoCreate ? { create: userInfoCreate } : undefined,
      },
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
    });
  }
}
