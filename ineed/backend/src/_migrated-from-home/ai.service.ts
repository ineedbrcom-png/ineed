import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly prisma: PrismaService) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  /**
   * Moderates content to check for harmful text.
   * This is a simplified example. Production use would require more robust handling.
   */
  async moderateContent(text: string): Promise<{ isInappropriate: boolean; reason?: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Analyze the following text for inappropriate content (hate speech, harassment, violence, adult content). Respond with only "YES" if it is inappropriate, or "NO" if it is not. Text: "${text}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text().trim().toUpperCase();

      if (aiResponse.includes('YES')) {
        return { isInappropriate: true, reason: 'Content flagged by AI.' };
      }
      return { isInappropriate: false };
    } catch (error) {
      this.logger.error('Error during content moderation with Gemini', error);
      // Fail open (allow content) if AI service fails, but log it.
      return { isInappropriate: false };
    }
  }

  /**
   * Generates a contract draft from a conversation.
   */
  async generateContractFromConversation(conversationId: string): Promise<{ contract: string }> {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { name: true } } },
    });

    if (messages.length === 0) {
      throw new InternalServerErrorException('No messages found for this conversation.');
    }

    const transcript = messages.map(msg => `${msg.sender.name}: ${msg.text}`).join('\n');
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Based on the following conversation transcript, generate a simple, informal contract summary. Extract the main service/product, the agreed price, and the delivery time. Format it clearly. Transcript:\n\n${transcript}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return { contract: response.text() };
  }
}