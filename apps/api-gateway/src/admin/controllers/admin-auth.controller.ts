import {
  Controller,
  Post,
  Get,
  Body,
  Inject,
  UseGuards,
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';

@ApiExcludeController()
@Controller('admin')
export class AdminAuthController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.login' }, loginDto),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }
}
