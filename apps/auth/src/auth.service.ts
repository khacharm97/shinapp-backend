import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(data: any) {
    const identifier = data.email || data.phone;
    const existingUser = await this.usersService.findByIdentifier(identifier);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Map string role to Prisma Role Enum
    const mappedRoles = data.role === 'master' ? ['MASTER'] : ['USER'];

    // We save email as identifier if it includes @, otherwise phone
    const isEmail = identifier.includes('@');

    const user = await this.usersService.create({
      name: data.name,
      email: isEmail ? identifier : null,
      phone: !isEmail ? identifier : null,
      password: hashedPassword,
      roles: mappedRoles as any, // Cast to any to avoid strict Prisma enum typing issues
    });

    return this.login(user);
  }

  async login(userOrCredentials: any) {
    let user = userOrCredentials;
    if (userOrCredentials.identifier && userOrCredentials.password) {
      const dbUser = await this.usersService.findByIdentifier(userOrCredentials.identifier);
      if (!dbUser) throw new UnauthorizedException('Invalid credentials');

      const isPasswordValid = await bcrypt.compare(userOrCredentials.password, dbUser.password);
      if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');
      
      user = dbUser;
    }

    const payload = { sub: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
