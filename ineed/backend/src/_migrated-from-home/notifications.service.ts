import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(userId: string, text: string, link?: string) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        text,
        link,
      },
    });

    // Envia a notificação em tempo real para o usuário, se ele estiver conectado
    this.notificationsGateway.sendNotificationToUser(userId, notification);

    return notification;
  }

  async findAllForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limita a 50 para não sobrecarregar
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId }, // Garante que o usuário só possa marcar suas próprias notificações
      data: { isRead: true },
    });
  }
}