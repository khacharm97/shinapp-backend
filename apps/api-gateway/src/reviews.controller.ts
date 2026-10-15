import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { R2StorageService } from './r2-storage.service';

const MAX_REVIEW_IMAGES = 3;
const MAX_REVIEW_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

@ApiTags('reviews')
@Controller('auth/reviews')
export class ReviewsController {
  constructor(
    @Inject('MASTERS_SERVICE') private readonly mastersService: ClientProxy,
    private readonly r2StorageService: R2StorageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new review for an order, with up to 3 photos',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('images', MAX_REVIEW_IMAGES, {
      limits: { fileSize: MAX_REVIEW_IMAGE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('review_images_invalid'), false);
        }
        cb(null, true);
      },
    }),
  )
  async createReview(
    @Request() req,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any,
  ) {
    const images =
      files && files.length > 0
        ? await Promise.all(
            files.map((file) =>
              this.r2StorageService.uploadFile(file, 'reviews'),
            ),
          )
        : [];

    const payload = {
      orderId: body.orderId,
      targetId: body.targetId,
      comment: body.comment || undefined,
      authorId: req.user.id,
      rating: body.rating ? parseInt(body.rating) : 5,
      images,
    };

    const result = await firstValueFrom(
      this.mastersService.send({ cmd: 'create-review' }, payload),
    );

    if (result && result.error) {
      // The review was rejected, so don't leave its photos behind in storage.
      await this.r2StorageService.deleteFiles(images);
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @Get('master/:masterId')
  @ApiOperation({ summary: 'Get all reviews for a master' })
  async getMasterReviews(@Param('masterId') masterId: string) {
    return firstValueFrom(
      this.mastersService.send({ cmd: 'get-master-reviews' }, { masterId }),
    );
  }

  @Get('brigade/:brigadeId')
  @ApiOperation({
    summary: "Get reviews received by a brigade's owner and members",
  })
  async getBrigadeReviews(@Param('brigadeId') brigadeId: string) {
    return firstValueFrom(
      this.mastersService.send({ cmd: 'get-brigade-reviews' }, { brigadeId }),
    );
  }

  @Get('technique/:techniqueId')
  @ApiOperation({ summary: 'Get reviews clients left on orders for a technique' })
  async getTechniqueReviews(@Param('techniqueId') techniqueId: string) {
    return firstValueFrom(
      this.mastersService.send({ cmd: 'get-technique-reviews' }, { techniqueId }),
    );
  }

  @Get('master/:masterId/busy-dates')
  @ApiOperation({ summary: 'Get busy dates for a master' })
  async getMasterBusyDates(@Param('masterId') masterId: string) {
    return firstValueFrom(
      this.mastersService.send({ cmd: 'get-master-busy-dates' }, { masterId }),
    );
  }
}
