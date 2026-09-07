import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  Inject,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { R2StorageService } from './r2-storage.service';

@ApiTags('techniques')
@Controller('auth')
export class TechniquesController {
  constructor(
    @Inject('MASTERS_SERVICE') private readonly mastersService: ClientProxy,
    private readonly r2StorageService: R2StorageService,
  ) {}

  @Get('techniques')
  @ApiOperation({ summary: 'Get a list of techniques with search and pagination' })
  async getTechniques(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    return firstValueFrom(
      this.mastersService.send(
        { cmd: 'get-techniques' },
        { page: pageNum, limit: limitNum, search },
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile/techniques')
  @ApiOperation({ summary: 'Get techniques owned by the current user' })
  async getMyTechniques(@Request() req) {
    return firstValueFrom(
      this.mastersService.send(
        { cmd: 'get-my-techniques' },
        { ownerId: req.user.id },
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('profile/techniques')
  @ApiOperation({ summary: 'Create a technique with up to 3 images' })
  @UseInterceptors(FilesInterceptor('images', 3))
  async createTechnique(
    @Request() req,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any,
  ) {
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.r2StorageService.uploadFile(file, 'techniques'),
      );
      imageUrls = await Promise.all(uploadPromises);
    }

    const payload = { ...body, imageUrls };
    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'create-technique' },
        { ownerId: req.user.id, payload },
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('profile/techniques/:id')
  @ApiOperation({ summary: 'Update a technique owned by the current user' })
  @UseInterceptors(FilesInterceptor('images', 3))
  async updateTechnique(
    @Request() req,
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any,
  ) {
    let newImageUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.r2StorageService.uploadFile(file, 'techniques'),
      );
      newImageUrls = await Promise.all(uploadPromises);
    }

    let existingImages: string[] = [];
    if (body.existingImages) {
      existingImages = Array.isArray(body.existingImages)
        ? body.existingImages
        : [body.existingImages];
    }

    const payload = {
      ...body,
      imageUrls: [...existingImages, ...newImageUrls],
    };

    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'update-technique' },
        { ownerId: req.user.id, id, payload },
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }

    if (result && result.removedImages && result.removedImages.length > 0) {
      await this.r2StorageService.deleteFiles(result.removedImages);
      delete result.removedImages;
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('profile/techniques/:id')
  @ApiOperation({ summary: 'Delete a technique owned by the current user' })
  async deleteTechnique(@Request() req, @Param('id') id: string) {
    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'delete-technique' },
        { ownerId: req.user.id, id },
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }

    if (result && result.removedImages && result.removedImages.length > 0) {
      await this.r2StorageService.deleteFiles(result.removedImages);
      delete result.removedImages;
    }

    return result;
  }

  @Get('techniques/:id/busy-dates')
  @ApiOperation({ summary: 'Get busy dates for a technique' })
  async getTechniqueBusyDates(@Param('id') id: string) {
    return firstValueFrom(
      this.mastersService.send(
        { cmd: 'get-technique-busy-dates' },
        { techniqueId: id },
      ),
    );
  }

  @Get('techniques/:id')
  @ApiOperation({ summary: 'Get a technique by ID' })
  async getTechniqueById(@Param('id') id: string) {
    return firstValueFrom(
      this.mastersService.send({ cmd: 'get-technique-by-id' }, { id }),
    );
  }
}
