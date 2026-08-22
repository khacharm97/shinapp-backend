import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(
    @Inject('MASTERS_SERVICE') private readonly mastersService: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new review for an order' })
  async createReview(@Request() req, @Body() body: any) {
    const payload = {
      ...body,
      authorId: req.user.id,
      rating: body.rating ? parseInt(body.rating) : 5,
    };

    const result = await firstValueFrom(
      this.mastersService.send({ cmd: 'create-review' }, payload),
    );

    if (result && result.error) {
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

  @Get('master/:masterId/busy-dates')
  @ApiOperation({ summary: 'Get busy dates for a master' })
  async getMasterBusyDates(@Param('masterId') masterId: string) {
    return firstValueFrom(
      this.mastersService.send({ cmd: 'get-master-busy-dates' }, { masterId }),
    );
  }
}
