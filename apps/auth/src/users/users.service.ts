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

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId },
      include: { userInfo: true },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
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
        avatarUrl: true,
        verifiedAt: true,
        userInfo: true,
      },
    });
    console.log('getUserProfile result:', user);
    return user;
  }



  async upsertUserInfo(userId: string, data: any) {
    const { name, phone, email, ...userInfoData } = data;

    // Update User core fields if provided
    if (name !== undefined || phone !== undefined || email !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined && { name: name || null }),
          ...(phone !== undefined && { phone: phone || null }),
          ...(email !== undefined && { email: email || null }),
        },
      });
    }

    // Upsert UserInfo fields
    await this.prisma.userInfo.upsert({
      where: { userId },
      update: userInfoData,
      create: {
        ...userInfoData,
        userId,
      },
    });

    await this.checkVerificationStatus(userId);
    return this.getUserProfile(userId);
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
    
    await this.checkVerificationStatus(userId);
    return this.getUserProfile(userId);
  }

  async checkVerificationStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userInfo: true },
    });

    if (!user) return;

    const isVerified = 
      !!user.avatarUrl &&
      !!user.phone &&
      !!user.email &&
      !!user.userInfo?.regionId &&
      !!user.userInfo?.cityId &&
      !!user.userInfo?.about &&
      (user.userInfo?.skills?.length || 0) >= 1;

    const currentlyVerified = user.verifiedAt !== null;
    
    if (isVerified && !currentlyVerified) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { verifiedAt: new Date() },
      });
    } else if (!isVerified && currentlyVerified) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { verifiedAt: null },
      });
    }
  }
}
