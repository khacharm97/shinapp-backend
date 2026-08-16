import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Inject,
  UseGuards,
  UnauthorizedException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { UpdateAnnouncementDto } from '../dto/update-announcement.dto';
import { R2StorageService } from '../../r2-storage.service';

@ApiExcludeController()
@Controller('admin/announcements')
export class AdminAnnouncementsController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    private readonly r2StorageService: R2StorageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAnnouncements() {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.get_announcements' }, {}),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 3))
  async createAnnouncement(
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
      this.adminClient.send({ cmd: 'admin.create_announcement' }, payload),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FilesInterceptor('images', 3))
  async updateAnnouncement(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any,
  ) {
    let newImageUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map(file => this.r2StorageService.uploadFile(file, 'announcements'));
      newImageUrls = await Promise.all(uploadPromises);
    }

    let existingImages: string[] = [];
    if (body.existingImages) {
      existingImages = Array.isArray(body.existingImages) 
        ? body.existingImages 
        : [body.existingImages];
    }
    
    const urgent = body.urgent === 'true' || body.urgent === true;
    const payload = { 
      ...body, 
      urgent,
      imageUrls: [...existingImages, ...newImageUrls] 
    };

    const result = await firstValueFrom(
      this.adminClient.send(
        { cmd: 'admin.update_announcement' },
        { id, payload },
      ),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    
    if (result && result.removedImages && result.removedImages.length > 0) {
      await this.r2StorageService.deleteFiles(result.removedImages);
      delete result.removedImages;
    }
    
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteAnnouncement(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.delete_announcement' }, { id }),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    
    if (result && result.removedImages && result.removedImages.length > 0) {
      await this.r2StorageService.deleteFiles(result.removedImages);
      delete result.removedImages;
    }
    
    return result;
  }
}
