import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@UseGuards(AuthGuard('jwt'))
@Controller('orders/:orderId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @GetUser('id') authorId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(orderId, authorId, createReviewDto);
  }
}