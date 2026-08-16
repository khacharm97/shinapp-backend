import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Inject,
  UnauthorizedException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { Roles } from './common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateMyAnnouncementDto } from './dto/create-my-announcement.dto';
import { UpdateMyAnnouncementDto } from './dto/update-my-announcement.dto';
import { R2StorageService } from './r2-storage.service';

@ApiTags('Client Announcements')
@Controller('auth/profile/announcements')
export class ClientAnnouncementsController {
  constructor(
    @Inject('MASTERS_SERVICE') private readonly mastersClient: ClientProxy,
    private readonly r2StorageService: R2StorageService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current company announcements' })
  async getMyAnnouncements(@Request() req) {
    const result = await firstValueFrom(
      this.mastersClient.send({ cmd: 'masters.get_my_announcements' }, { companyId: req.user.id }),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an announcement' })
  @UseInterceptors(FilesInterceptor('images', 3))
  async createAnnouncement(
    @Request() req, 
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any
  ) {
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => this.r2StorageService.uploadFile(file, 'announcements'));
      imageUrls = await Promise.all(uploadPromises);
    }
    
    // Convert string fields to booleans if sent via FormData
    const urgent = body.urgent === 'true' || body.urgent === true;
    
    const payload = { ...body, urgent, imageUrls };
    const result = await firstValueFrom(
      this.mastersClient.send({ cmd: 'masters.create_my_announcement' }, { companyId: req.user.id, payload }),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an announcement' })
  @UseInterceptors(FilesInterceptor('images', 3))
  async updateAnnouncement(
    @Request() req,
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any,
  ) {
    let newImageUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => this.r2StorageService.uploadFile(file, 'announcements'));
      newImageUrls = await Promise.all(uploadPromises);
    }

    // Parse existing images array (FormData usually sends multiple existingImages as an array or a single string)
    let existingImages: string[] = [];
    if (body.existingImages) {
      existingImages = Array.isArray(body.existingImages) 
        ? body.existingImages 
        : [body.existingImages];
    }
    
    // Convert string fields if sent via FormData
    const urgent = body.urgent === 'true' || body.urgent === true;
    const payload = { 
      ...body, 
      urgent,
      imageUrls: [...existingImages, ...newImageUrls] 
    };

    const result = await firstValueFrom(
      this.mastersClient.send(
        { cmd: 'masters.update_my_announcement' },
        { id, payload, companyId: req.user.id },
      ),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    
    // Clean up removed images from R2
    if (result && result.removedImages && result.removedImages.length > 0) {
      await this.r2StorageService.deleteFiles(result.removedImages);
      delete result.removedImages;
    }
    
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an announcement' })
  async deleteAnnouncement(@Request() req, @Param('id') id: string) {
    const result = await firstValueFrom(
      this.mastersClient.send(
        { cmd: 'masters.delete_my_announcement' },
        { id, companyId: req.user.id },
      ),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    
    // Clean up all images from R2 when the announcement is deleted
    if (result && result.removedImages && result.removedImages.length > 0) {
      await this.r2StorageService.deleteFiles(result.removedImages);
      delete result.removedImages;
    }
    
    return result;
  }
}
