import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Notification } from '@prisma/client';

@WebSocketGateway({
  namespace: 'notifications', // Usamos um namespace para separar a lógica
  cors: {
    origin: '*', // Em produção, restrinja para o seu domínio do frontend
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationsGateway');

  constructor(private readonly jwtService: JwtService) {}

  // Quando um cliente se conecta
  handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization.split(' ')[1];
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'SUPER_SECRET_KEY' });
      const userId = payload.sub;

      // O usuário entra em uma sala com seu próprio ID
      client.join(userId);
      this.logger.log(`Client ${client.id} (User: ${userId}) connected and joined room.`);
    } catch (e) {
      this.logger.error('Authentication failed for WebSocket connection.', e.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Método para ser chamado por outros serviços para enviar uma notificação
  sendNotificationToUser(userId: string, notification: Notification) {
    this.server.to(userId).emit('new_notification', notification);
  }
}