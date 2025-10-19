import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OffersService } from './offers.service';

@UseGuards(AuthGuard('jwt'))
@Controller('orders/:orderId/offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @GetUser('id') providerId: string,
    @Body() createOfferDto: CreateOfferDto,
  ) {
    return this.offersService.create(orderId, providerId, createOfferDto);
  }
}