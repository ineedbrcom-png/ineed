import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';

@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('moderate')
  async moderateContent(@Body('text') text: string) {
    if (!text) {
      return { isInappropriate: false };
    }
    return this.aiService.moderateContent(text);
  }

  @Post('generate-contract')
  async generateContract(@Body('conversationId') conversationId: string) {
    return this.aiService.generateContractFromConversation(conversationId);
  }
}