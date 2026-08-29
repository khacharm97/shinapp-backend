import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @MessagePattern({ cmd: 'create-review' })
  createReview(@Payload() data: any) {
    return this.reviewsService.createReview(data);
  }

  @MessagePattern({ cmd: 'get-master-reviews' })
  getMasterReviews(@Payload() data: { masterId: string }) {
    return this.reviewsService.getReviewsForMaster(data.masterId);
  }
}
