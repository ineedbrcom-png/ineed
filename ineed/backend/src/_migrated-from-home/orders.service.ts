import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findClientOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { clientId: userId },
      include: {
        request: { select: { title: true, categoryId: true } },
        _count: { select: { offers: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findProviderOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { providerId: userId },
      include: {
        request: { select: { title: true, categoryId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        request: { include: { user: { select: { name: true, avatarUrl: true } } } },
        client: { select: { id: true, name: true, avatarUrl: true } },
        provider: { select: { id: true, name: true, avatarUrl: true } },
        offers: {
          include: {
            provider: { select: { id: true, name: true, avatarUrl: true, avgRating: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    // Garante que apenas o cliente ou o provedor (se já aceito) possam ver os detalhes
    const isClient = order.clientId === userId;
    const isProvider = order.providerId === userId;

    if (!isClient && !isProvider) {
      throw new ForbiddenException('Você não tem permissão para ver este pedido.');
    }

    return order;
  }

  async acceptOffer(orderId: string, offerId: string, clientId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { request: { select: { title: true } } },
      });

      if (!order) {
        throw new NotFoundException('Pedido não encontrado.');
      }

      if (order.clientId !== clientId) {
        throw new ForbiddenException('Você não é o dono deste pedido.');
      }

      if (order.status !== 'Ativo') {
        throw new BadRequestException('Este pedido não está mais ativo.');
      }

      const offer = await tx.offer.findUnique({
        where: { id: offerId },
      });

      if (!offer || offer.orderId !== orderId) {
        throw new NotFoundException('Oferta não encontrada ou não pertence a este pedido.');
      }

      // Notifica o prestador escolhido
      await this.notificationsService.create(
        offer.providerId,
        `Sua oferta para "${order.request.title}" foi aceita!`,
        `/orders/${order.id}`,
      );

      // Atualiza o pedido para refletir a oferta aceita
      return tx.order.update({
        where: { id: orderId },
        data: {
          providerId: offer.providerId,
          finalValue: offer.value,
          // Aqui você poderia mudar o status para algo como 'Em Andamento'
        },
      });
    });
  }
}