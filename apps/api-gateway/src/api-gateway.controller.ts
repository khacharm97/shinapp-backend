import { Body, Controller, Post, Put, Get, UseGuards, Request, Inject, Param, Query, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { Roles } from './common/decorators/roles.decorator';
import { Role } from '@prisma/client';

import { GoogleAuthGuard } from './common/guards/google-auth.guard';

@Controller('auth')
export class ApiGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('MASTERS_SERVICE') private readonly mastersService: ClientProxy
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req) {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req, @Res() res) {
    // googleUser comes from the GoogleStrategy validate method
    const googleUser = req.user;
    
    // Pass the state back to the auth service
    googleUser.role = req.query.state;

    
    // Send user data to auth microservice to get/create user and JWT
    const result = await firstValueFrom(this.authService.send({ cmd: 'google-login' }, googleUser));
    
    // Redirect back to frontend with the token
    const frontendUrl = 'http://localhost:5173/auth/callback';
    return res.redirect(`${frontendUrl}?token=${result.access_token}`);
  }

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
    return firstValueFrom(this.mastersService.send({ cmd: 'get-masters' }, { page: pageNum, limit: limitNum }));
  }

  @Get('masters/:id')
  async getMasterById(@Param('id') id: string) {
    return firstValueFrom(this.mastersService.send({ cmd: 'get-master-by-id' }, { id }));
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

  @UseGuards(JwtAuthGuard)
  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/avatars';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('File not found');
    }
    
    // Attempt to delete old avatar if it exists
    try {
      const oldProfile = await firstValueFrom(this.authService.send({ cmd: 'get-profile' }, { userId: req.user.id }));
      if (oldProfile && oldProfile.avatarUrl) {
        // e.g. avatarUrl is "/uploads/avatars/xyz.jpg", we join it with process.cwd()
        const oldFilePath = join(process.cwd(), oldProfile.avatarUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    } catch (e) {
      console.error('Failed to delete old avatar:', e);
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const result = await firstValueFrom(this.authService.send({ cmd: 'update-avatar' }, { userId: req.user.id, avatarUrl }));
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin-only')
  getAdminData(@Request() req) {
    return { message: 'Welcome to the admin area!', user: req.user };
  }
}
