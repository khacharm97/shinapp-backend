import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() data: any) {
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: any) {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'get-profile' })
  async getProfile(@Payload() data: { userId: string }) {
    return this.authService.getProfile(data.userId);
  }

  @MessagePattern({ cmd: 'get-masters' })
  async getMasters(@Payload() data: { page: number, limit: number }) {
    return this.authService.getMasters(data.page, data.limit);
  }

  @MessagePattern({ cmd: 'update-profile' })
  async updateProfile(@Payload() data: { userId: string, profileData: any }) {
    return this.authService.updateProfile(data.userId, data.profileData);
  }
}
