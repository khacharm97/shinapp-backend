import { Body, Controller, Post, Put, Get, UseGuards, Request, Inject, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { Roles } from './common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('auth')
export class ApiGatewayController {
  constructor(@Inject('AUTH_SERVICE') private readonly authService: ClientProxy) {}

  @Post('register')
  async register(@Body() body: any) {
    const result = await firstValueFrom(this.authService.send({ cmd: 'register' }, body));
    console.log('Microservice register returned:', result);
    return result;
  }

  @Post('login')
  async login(@Body() body: any) {
    const result = await firstValueFrom(this.authService.send({ cmd: 'login' }, body));
    console.log('Microservice login returned:', result);
    return result;
  }

  @Get('masters')
  async getMasters(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return firstValueFrom(this.authService.send({ cmd: 'get-masters' }, { page: pageNum, limit: limitNum }));
  }

  @Get('test-profile/:id')
  async testProfile(@Param('id') id: string) {
    const result = await firstValueFrom(this.authService.send({ cmd: 'get-profile' }, { userId: id }));
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    console.log('API Gateway getProfile called with req.user:', req.user);
    const result = await firstValueFrom(this.authService.send({ cmd: 'get-profile' }, { userId: req.user.id }));
    console.log('Microservice returned:', result);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  updateProfile(@Request() req, @Body() body: any) {
    return this.authService.send({ cmd: 'update-profile' }, { userId: req.user.id, profileData: body });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin-only')
  getAdminData(@Request() req) {
    return { message: 'Welcome to the admin area!', user: req.user };
  }
}
