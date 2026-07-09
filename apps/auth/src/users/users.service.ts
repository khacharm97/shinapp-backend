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
        isBlocked: true,
        userInfo: true,
        portfolios: {
          orderBy: {
            order: 'asc'
          }
        }
      },
    });
    console.log('getUserProfile result:', user);
    return user;
  }

  async createPortfolio(userId: string, data: { title: string, description?: string, imageUrls: string[], order?: number }) {
    await this.prisma.portfolio.create({
      data: {
        userId,
        ...data,
      }
    });
    return this.getUserProfile(userId);
  }

  async deletePortfolio(userId: string, portfolioId: string) {
    const portfolio = await this.prisma.portfolio.findFirst({
      where: { id: portfolioId, userId }
    });
    
    if (portfolio) {
      await this.prisma.portfolio.delete({
        where: { id: portfolioId }
      });
    }
    return this.getUserProfile(userId);
  }

  async checkBlocked(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isBlocked: true },
    });
    return { isBlocked: user?.isBlocked || false };
  }

  async upsertUserInfo(userId: string, data: any) {
    const { name, phone, email, ...userInfoData } = data;

    // Handle custom skills
    if (userInfoData.skills && Array.isArray(userInfoData.skills)) {
      const existingSkills = await this.prisma.skill.findMany({
        where: { key: { in: userInfoData.skills } }
      });
      const existingKeys = new Set(existingSkills.map(s => s.key));

      const newSkillsToCreate = userInfoData.skills.filter((skillKey: string) => !existingKeys.has(skillKey));
      for (const newSkillName of newSkillsToCreate) {
        // Generate a slug-like key
        const generatedKey = newSkillName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        
        // Ensure it doesn't already exist by key (e.g. user typed a key accidentally)
        const check = await this.prisma.skill.findUnique({ where: { key: generatedKey }});
        if (!check) {
          await this.prisma.skill.create({
            data: {
              key: generatedKey,
              nameEn: newSkillName,
              nameAm: newSkillName,
              nameRu: newSkillName,
              approved: false,
            }
          });
        }
        
        // Replace the user's raw input with the generated key in their skills array
        const index = userInfoData.skills.indexOf(newSkillName);
        if (index !== -1) {
          userInfoData.skills[index] = generatedKey;
        }
      }
      
      // Filter out empty keys that might result from weird characters
      userInfoData.skills = userInfoData.skills.filter((k: string) => k.length > 0);
    }

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
