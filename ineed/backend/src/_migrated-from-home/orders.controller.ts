import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { OrdersService } from './orders.service';

@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('client')
  findClientOrders(@GetUser('id') userId: string) {
    return this.ordersService.findClientOrders(userId);
  }

  @Get('provider')
  findProviderOrders(@GetUser('id') userId: string) {
    return this.ordersService.findProviderOrders(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ) {
    return this.ordersService.findOne(id, userId);
  }

  @Post(':id/accept-offer')
  acceptOffer(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Body('offerId') offerId: string,
    @GetUser('id') clientId: string,
  ) {
    return this.ordersService.acceptOffer(orderId, offerId, clientId);
  }
}