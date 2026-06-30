import { Controller, Post, Get, Put, Param, Body, Inject, UseGuards, UnauthorizedException, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Controller('admin')
export class AdminGatewayController {
  constructor(@Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    const result = await firstValueFrom(this.adminClient.send({ cmd: 'admin.login' }, loginDto));
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

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getUsers() {
    const result = await firstValueFrom(this.adminClient.send({ cmd: 'admin.get_users' }, {}));
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('contact-requests')
  async getContactRequests() {
    const result = await firstValueFrom(this.adminClient.send({ cmd: 'admin.get_contact_requests' }, {}));
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put('contact-requests/:id/read')
  async markContactRequestRead(@Param('id') id: string) {
    const result = await firstValueFrom(this.adminClient.send({ cmd: 'admin.mark_contact_request_read' }, { id }));
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }
}
