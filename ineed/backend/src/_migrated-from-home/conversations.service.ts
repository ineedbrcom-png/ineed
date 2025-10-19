import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        order: {
          include: {
            request: { select: { title: true } },
          },
        },
        participants: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMessages(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { userId } } },
    });

    if (!conversation) {
      throw new ForbiddenException('Você não tem acesso a esta conversa.');
    }

    return this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}