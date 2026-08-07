import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    const identifier = data.email || data.phone;
    const existingUser = await this.usersService.findByIdentifier(identifier);
    if (existingUser) {
      throw new ConflictException('auth_error_user_exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Map string role to Prisma Role Enum
    const mappedRoles = data.role === 'master' ? ['MASTER'] : ['USER'];

    // We save email as identifier if it includes @, otherwise phone
    const isEmail = identifier.includes('@');

    const user = await this.usersService
      .create({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        password: hashedPassword,
        roles: mappedRoles as any, // Cast to any to avoid strict Prisma enum typing issues
      })
      .catch((e) => {
        if (e.code === 'P2002') {
          throw new ConflictException('auth_error_user_exists');
        }
        throw e;
      });

    return this.login(user);
  }

  async login(userOrCredentials: any) {
    let user = userOrCredentials;
    if (userOrCredentials.identifier && userOrCredentials.password) {
      const dbUser = await this.usersService.findByIdentifier(
        userOrCredentials.identifier,
      );
      if (!dbUser || !dbUser.password)
        throw new UnauthorizedException('auth_error_invalid_credentials');

      const isPasswordValid = await bcrypt.compare(
        userOrCredentials.password,
        dbUser.password,
      );
      if (!isPasswordValid)
        throw new UnauthorizedException('auth_error_invalid_credentials');

      user = dbUser;
    }

    if (user.isBlocked) {
      throw new ForbiddenException('auth_error_user_blocked');
    }

    const payload = { sub: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        userInfo: user.userInfo || null,
      },
    };
  }

  async googleLogin(profile: any) {
    if (!profile) {
      throw new UnauthorizedException('No user from google');
    }

    let user = await this.usersService.findByGoogleId(profile.googleId);

    if (!user && profile.email) {
      user = await this.usersService.findByIdentifier(profile.email);
      if (user) {
        // Link existing account with Google ID
        user = await this.usersService.update(user.id, {
          googleId: profile.googleId,
        });
      }
    }

    const mappedRoles = profile.role === 'master' ? ['MASTER'] : ['USER'];

    if (!user) {
      // Create new user if not found
      user = await this.usersService.create({
        googleId: profile.googleId,
        email: profile.email,
        name: profile.firstName
          ? `${profile.firstName} ${profile.lastName || ''}`.trim()
          : 'Google User',
        roles: mappedRoles as any,
        // password is now optional in schema, so we can omit it
      });
    } else if (profile.role === 'master' && !user.roles.includes('MASTER')) {
      // Add MASTER role if they specifically signed up as master this time via google
      user = await this.usersService.update(user.id, {
        roles: [...user.roles, 'MASTER'] as any,
      });
    }

    return this.login(user);
  }

  async getProfile(userId: string) {
    return this.usersService.getUserProfile(userId);
  }

  async updateProfile(userId: string, data: any) {
    return this.usersService.upsertUserInfo(userId, data);
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.usersService.updateAvatar(userId, avatarUrl);
  }

  async createPortfolio(
    userId: string,
    data: {
      title: string;
      description?: string;
      imageUrls: string[];
      order?: number;
    },
  ) {
    return this.usersService.createPortfolio(userId, data);
  }

  async deletePortfolio(userId: string, portfolioId: string) {
    return this.usersService.deletePortfolio(userId, portfolioId);
  }
}
