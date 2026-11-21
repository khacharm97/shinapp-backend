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
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { CreateSkillDto } from '../dto/create-skill.dto';
import { UpdateSkillDto } from '../dto/update-skill.dto';
import { R2StorageService } from '../../r2-storage.service';
import sharp from 'sharp';

const MAX_SKILL_ICON_SIZE = 2 * 1024 * 1024; // 2 MB
const SKILL_ICON_MAX_DIMENSION = 128; // px; icons display at 16–24px
const ALLOWED_ICON_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

@ApiExcludeController()
@Controller('admin/skills')
export class AdminSkillsController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    private readonly r2StorageService: R2StorageService,
  ) {}

  // Uploads a custom skill icon image and returns its public URL. The admin UI
  // stores that URL in the skill's `icon` field, same as a pasted custom URL.
  @UseGuards(JwtAuthGuard)
  @Post('icon')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_SKILL_ICON_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_ICON_MIME_TYPES.includes(file.mimetype)) {
          return cb(new BadRequestException('Unsupported image type'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadSkillIcon(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const resized = await this.shrinkIcon(file);
    const url = await this.r2StorageService.uploadFile(resized, 'skills');
    return { url };
  }

  // Scales raster icons down to fit within 128x128, keeping aspect ratio and
  // format (animated GIF/WebP stay animated). Smaller images and SVGs (vector,
  // so size doesn't matter) are passed through untouched.
  private async shrinkIcon(file: Express.Multer.File): Promise<Express.Multer.File> {
    if (file.mimetype === 'image/svg+xml') return file;

    let image: sharp.Sharp;
    let meta: sharp.Metadata;
    try {
      image = sharp(file.buffer, { animated: true });
      meta = await image.metadata();
    } catch {
      throw new BadRequestException('Invalid image file');
    }

    const width = meta.width ?? 0;
    // For animated images `height` is the sum of all frames.
    const height = meta.pageHeight ?? meta.height ?? 0;
    if (width <= SKILL_ICON_MAX_DIMENSION && height <= SKILL_ICON_MAX_DIMENSION) {
      return file;
    }

    const buffer = await image
      .rotate() // apply EXIF orientation before resizing
      .resize(SKILL_ICON_MAX_DIMENSION, SKILL_ICON_MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

    return { ...file, buffer, size: buffer.length };
  }

  // Discards icons uploaded in the admin form but never saved to a skill.
  // Only files in the R2 `skills/` folder that no skill references are deleted,
  // so this is safe to call for the icon that did end up saved.
  @UseGuards(JwtAuthGuard)
  @Delete('icon')
  async discardSkillIcons(@Body() body: { urls?: string[] }) {
    const publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
    const urls = Array.isArray(body?.urls) ? body.urls.slice(0, 20) : [];
    const candidates = urls.filter(
      (url) => typeof url === 'string' && !!publicUrl && url.startsWith(`${publicUrl}/skills/`),
    );

    const deleted: string[] = [];
    for (const url of candidates) {
      const result = await firstValueFrom(
        this.adminClient.send({ cmd: 'admin.is_skill_icon_used' }, { icon: url }),
      );
      if (result && result.error) throw new UnauthorizedException(result.error);
      if (!result.used) {
        await this.r2StorageService.deleteFile(url);
        deleted.push(url);
      }
    }
    return { deleted };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllSkills() {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.get_all_skills' }, {}),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSkill(@Body() data: CreateSkillDto) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.create_skill' }, data),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateSkill(@Param('id') id: string, @Body() payload: UpdateSkillDto) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.update_skill' }, { id, payload }),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return this.cleanupOrphanedIcon(result);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSkill(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.delete_skill' }, { id }),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return this.cleanupOrphanedIcon(result);
  }

  // Removes an uploaded icon no skill references anymore, and returns the
  // skill itself so the response shape stays the same for clients.
  // deleteFile skips non-R2 URLs and never throws.
  private async cleanupOrphanedIcon(result: { skill: any; orphanedIcon: string | null }) {
    if (result.orphanedIcon) {
      await this.r2StorageService.deleteFile(result.orphanedIcon);
    }
    return result.skill;
  }
}
