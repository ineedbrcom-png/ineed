import { Controller, Get, Param, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { NotificationsService } from './notifications.service';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAllForUser(@GetUser('id') userId: string) {
    return this.notificationsService.findAllForUser(userId);
  }

  @Put(':id/read')
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ) {
    // Retorna o resultado da operação (ex: { count: 1 })
    return this.notificationsService.markAsRead(id, userId);
  }
}