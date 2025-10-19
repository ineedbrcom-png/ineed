import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ConversationsService } from './conversations.service';

@UseGuards(AuthGuard('jwt'))
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  findAllForUser(@GetUser('id') userId: string) {
    return this.conversationsService.findAllForUser(userId);
  }

  @Get(':id/messages')
  findMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ) {
    return this.conversationsService.findMessages(id, userId);
  }
}