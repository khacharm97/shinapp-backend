import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      // Guest accounts only exist for support chat - they aren't real users.
      where: { isGuest: false },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        createdAt: true,
        isBlocked: true,
        verifiedAt: true,
        userInfo: true,
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
        regionId: data.regionId || null,
        cityId: data.cityId || null,
        largeScale: data.largeScale || false,
        urgentOrders: data.urgentOrders || false,
        onlinePay: data.onlinePay || false,
        buyMaterial: data.buyMaterial || false,
        nightShift: data.nightShift || false,
        multipleJobs: data.multipleJobs || false,
        socialFacebook: data.socialFacebook || null,
        socialInstagram: data.socialInstagram || null,
        socialTiktok: data.socialTiktok || null,
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

  async updateUser(id: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestException('User not found');

    if (data.email && data.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) throw new BadRequestException('User with this email already exists');
    }
    if (data.phone && data.phone !== user.phone) {
      const existingPhone = await this.prisma.user.findUnique({ where: { phone: data.phone } });
      if (existingPhone) throw new BadRequestException('User with this phone already exists');
    }

    const updateData: any = {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    let roles: Role[] = [Role.USER];
    if (data.role === 'MASTER') roles = [Role.MASTER];
    else if (data.role === 'COMPANY') roles = [Role.COMPANY];
    else if (data.role === 'ADMIN') roles = [Role.ADMIN];
    updateData.roles = roles;

    const isMasterOrCompany = roles.includes(Role.MASTER) || roles.includes(Role.COMPANY);
    const existingUserInfo = await this.prisma.userInfo.findUnique({ where: { userId: id } });

    if (isMasterOrCompany) {
      const userInfoData = {
        skills: data.skills || [],
        pricingFormat: data.pricingFormat || null,
        priceValue: data.priceValue || null,
        about: data.about || null,
        itn: data.itn || null,
        workersCount: data.workersCount ? parseInt(data.workersCount, 10) : null,
        website: data.website || null,
        regionId: data.regionId || null,
        cityId: data.cityId || null,
        largeScale: data.largeScale || false,
        urgentOrders: data.urgentOrders || false,
        onlinePay: data.onlinePay || false,
        buyMaterial: data.buyMaterial || false,
        nightShift: data.nightShift || false,
        multipleJobs: data.multipleJobs || false,
        socialFacebook: data.socialFacebook || null,
        socialInstagram: data.socialInstagram || null,
        socialTiktok: data.socialTiktok || null,
      };

      updateData.userInfo = {
        upsert: {
          create: userInfoData,
          update: userInfoData
        }
      };
    } else if (existingUserInfo) {
      updateData.userInfo = { delete: true };
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
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
