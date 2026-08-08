import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'admin.login' })
  async login(data: any) {
    try {
      const result = await this.authService.login(data);
      return result;
    } catch (e) {
      return { error: e.message || 'Login failed' };
    }
  }
}
