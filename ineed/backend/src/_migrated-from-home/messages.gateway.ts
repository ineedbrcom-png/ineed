import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@UseGuards(WsJwtGuard) // Protege todo o gateway com nosso guard JWT para WebSockets
@WebSocketGateway({
  cors: {
    origin: '*', // Em produção, restrinja para o seu domínio do frontend
  },
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('MessagesGateway');

  constructor(private readonly prisma: PrismaService) {}

  @SubscribeMessage('join-conversation')
  async handleJoinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    // A lógica de autorização (se o usuário pertence a esta conversa)
    // pode ser adicionada aqui ou em um guard mais específico.
    client.join(conversationId);
    this.logger.log(`Client ${client.id} joined conversation ${conversationId}`);
    // Opcional: emitir um evento de confirmação
    client.emit('joined-conversation', conversationId);
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @MessageBody()
    payload: { conversationId: string; text: string; senderId: string },
  ): Promise<void> {
    const { conversationId, text, senderId } = payload;

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        text,
        senderId,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Emite a nova mensagem para todos os clientes na sala da conversa
    this.server.to(conversationId).emit('new-message', message);
    this.logger.log(`Message sent in conversation ${conversationId}`);
  }
}