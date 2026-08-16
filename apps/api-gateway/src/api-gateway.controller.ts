import {
  Body,
  Controller,
  Post,
  Put,
  Get,
  Delete,
  UseGuards,
  Request,
  Inject,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { Roles } from './common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiExcludeEndpoint, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';

import { GoogleAuthGuard } from './common/guards/google-auth.guard';
import { NotificationsGateway } from './notifications.gateway';

import { R2StorageService } from './r2-storage.service';
import { toHttpException } from './common/utils/rpc-error.util';

@Controller('auth')
export class ApiGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('MASTERS_SERVICE') private readonly mastersService: ClientProxy,
    @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsService: ClientProxy,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly r2StorageService: R2StorageService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  async googleAuth(@Request() req) {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(@Request() req, @Res() res) {
    // googleUser comes from the GoogleStrategy validate method
    const googleUser = req.user;

    // Pass the state back to the auth service
    googleUser.role = req.query.state;

    // Send user data to auth microservice to get/create user and JWT
    const result = await firstValueFrom(
      this.authService.send({ cmd: 'google-login' }, googleUser),
    );

    // Redirect back to frontend with the token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${result.access_token}`,
    );
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() body: any) {
    try {
      return await firstValueFrom(
        this.authService.send({ cmd: 'register' }, body),
      );
    } catch (err) {
      throw toHttpException(err);
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  async login(@Body() body: any) {
    try {
      return await firstValueFrom(
        this.authService.send({ cmd: 'login' }, body),
      );
    } catch (err) {
      throw toHttpException(err);
    }
  }

  @Get('skills')
  @ApiOperation({ 
    summary: 'Get list of skills',
    description: 'Returns a list of skills ordered alphabetically by their English name. If approvedOnly=false, it returns all skills including those pending approval.'
  })
  @ApiQuery({ 
    name: 'approvedOnly', 
    required: false, 
    type: String, 
    description: 'If true (default), returns only skills approved by an admin. If false, returns all skills including pending ones.' 
  })
  async getSkills(@Query('approvedOnly') approvedOnly: string = 'true') {
    return firstValueFrom(
      this.mastersService.send(
        { cmd: 'get-skills' },
        { approvedOnly: approvedOnly === 'true' },
      ),
    );
  }

  @Post('skills/suggest')
  @ApiOperation({ summary: 'Suggest a new skill' })
  async suggestSkill(@Body() body: any) {
    return firstValueFrom(
      this.mastersService.send({ cmd: 'suggest-skill' }, body),
    );
  }

  @Get('masters')
  @ApiOperation({ summary: 'Get a list of masters with filtering and pagination' })
  async getMasters(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('regionId') regionId?: string,
    @Query('cityId') cityId?: string,
    @Query('topRated') topRated?: string,
    @Query('availableNow') availableNow?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    return firstValueFrom(
      this.mastersService.send(
        { cmd: 'get-masters' },
        {
          page: pageNum,
          limit: limitNum,
          search,
          regionId,
          cityId,
          topRated: topRated === 'true',
          availableNow: availableNow === 'true',
        },
      ),
    );
  }

  @Get('masters/:id')
  @ApiOperation({ summary: 'Get a master profile by ID' })
  async getMasterById(@Param('id') id: string) {
    return firstValueFrom(
      this.mastersService.send({ cmd: 'get-master-by-id' }, { id }),
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Global search for masters' })
  async globalSearch(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('regionId') regionId?: string,
    @Query('cityId') cityId?: string,
    @Query('topRated') topRated?: string,
    @Query('availableNow') availableNow?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    return firstValueFrom(
      this.mastersService.send(
        { cmd: 'global-search' },
        {
          page: pageNum,
          limit: limitNum,
          search,
          regionId,
          cityId,
          topRated: topRated === 'true',
          availableNow: availableNow === 'true',
        },
      ),
    );
  }

  @Get('test-profile/:id')
  @ApiOperation({ summary: 'Test getting a profile by ID' })
  async testProfile(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.authService.send({ cmd: 'get-profile' }, { userId: id }),
    );
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    console.log('API Gateway getProfile called with req.user:', req.user);
    const result = await firstValueFrom(
      this.authService.send({ cmd: 'get-profile' }, { userId: req.user.id }),
    );
    console.log('Microservice returned:', result);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@Request() req, @Body() body: any) {
    return this.authService.send(
      { cmd: 'update-profile' },
      { userId: req.user.id, profileData: body },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/avatar')
  @ApiOperation({ summary: 'Upload avatar for current user' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('File not found');
    }

    const avatarUrl = await this.r2StorageService.uploadFile(file, 'avatars');
    
    const result = await firstValueFrom(
      this.authService.send(
        { cmd: 'update-avatar' },
        { userId: req.user.id, avatarUrl },
      ),
    );
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MASTER)
  @Post('profile/portfolio')
  @ApiOperation({ summary: 'Create a new portfolio entry with images' })
  @UseInterceptors(FilesInterceptor('images', 3))
  async createPortfolio(
    @Request() req,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any,
  ) {
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => this.r2StorageService.uploadFile(file, 'portfolios'));
      imageUrls = await Promise.all(uploadPromises);
    }

    const portfolioData = {
      title: body.title,
      description: body.description,
      order: body.order ? parseInt(body.order, 10) : 0,
      imageUrls,
    };

    return firstValueFrom(
      this.authService.send(
        { cmd: 'create-portfolio' },
        { userId: req.user.id, portfolioData },
      ),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MASTER)
  @Delete('profile/portfolio/:id')
  @ApiOperation({ summary: 'Delete a portfolio entry' })
  async deletePortfolio(@Request() req, @Param('id') id: string) {
    return firstValueFrom(
      this.authService.send(
        { cmd: 'delete-portfolio' },
        { userId: req.user.id, portfolioId: id },
      ),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MASTER)
  @Post('profile/brigade')
  @ApiOperation({ summary: 'Create a new Brigade and invite members' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Super Builders' },
        invites: { type: 'array', items: { type: 'string' }, example: ['test@example.com'] },
      },
    },
  })
  async createBrigade(@Request() req, @Body() body: { name: string; invites: string[] }) {
    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'create-brigade' },
        { ownerId: req.user.id, name: body.name, invites: body.invites || [] },
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MASTER)
  @Get('profile/brigade')
  @ApiOperation({ summary: 'Get all brigades owned by the current master' })
  async getBrigades(@Request() req) {
    return firstValueFrom(
      this.mastersService.send({ cmd: 'get-brigades' }, { ownerId: req.user.id }),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MASTER)
  @Delete('profile/brigade/:id')
  @ApiOperation({ summary: 'Delete a brigade' })
  async deleteBrigade(@Request() req, @Param('id') id: string) {
    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'delete-brigade' },
        { ownerId: req.user.id, brigadeId: id }
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MASTER)
  @Put('profile/brigade/:id')
  @ApiOperation({ summary: 'Update a brigade' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Builders' },
        invites: { type: 'array', items: { type: 'string' }, example: ['new@example.com'] },
        removeMemberIds: { type: 'array', items: { type: 'string' }, example: ['uuid'] },
      },
    },
  })
  async updateBrigade(@Request() req, @Param('id') id: string, @Body() body: { name: string; invites: string[]; removeMemberIds: string[] }) {
    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'update-brigade' },
        { 
          ownerId: req.user.id, 
          brigadeId: id, 
          name: body.name, 
          invites: body.invites || [],
          removeMemberIds: body.removeMemberIds || [] 
        }
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MASTER, Role.USER)
  @Post('profile/brigade/invite/:brigadeId/accept')
  @ApiOperation({ summary: 'Accept a brigade invite' })
  async acceptBrigadeInvite(@Request() req, @Param('brigadeId') brigadeId: string) {
    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'accept-brigade-invite' },
        { userId: req.user.id, brigadeId }
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MASTER, Role.USER)
  @Post('profile/brigade/invite/:brigadeId/reject')
  @ApiOperation({ summary: 'Reject a brigade invite' })
  async rejectBrigadeInvite(@Request() req, @Param('brigadeId') brigadeId: string) {
    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'reject-brigade-invite' },
        { userId: req.user.id, brigadeId }
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  @ApiOperation({ summary: 'Get user notifications' })
  async getNotifications(@Request() req) {
    return firstValueFrom(
      this.notificationsService.send({ cmd: 'get-notifications' }, { userId: req.user.id }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('notifications/:id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markNotificationRead(@Request() req, @Param('id') id: string) {
    return firstValueFrom(
      this.notificationsService.send(
        { cmd: 'mark-notification-read' },
        { userId: req.user.id, notificationId: id }
      ),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiExcludeEndpoint()
  @Get('admin-only')
  getAdminData(@Request() req) {
    return { message: 'Welcome to the admin area!', user: req.user };
  }

  @MessagePattern({ cmd: 'send-ws-notification' })
  handleSendWsNotification(@Payload() data: { userId: string; notification: any }) {
    this.notificationsGateway.sendNotificationToUser(data.userId, data.notification);
    return { success: true };
  }

  @MessagePattern('send_ws_event')
  handleSendWsEvent(@Payload() data: { userId: string; event: string; payload: any }) {
    this.notificationsGateway.sendEventToUser(data.userId, data.event, data.payload);
    return { success: true };
  }
}
