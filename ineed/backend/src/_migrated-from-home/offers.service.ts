import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(orderId: string, providerId: string, createOfferDto: CreateOfferDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { request: { select: { title: true } } },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    if (order.clientId === providerId) {
      throw new BadRequestException('Você não pode fazer uma oferta no seu próprio pedido.');
    }

    if (order.status !== 'Ativo') {
      throw new BadRequestException('Este pedido não está mais aceitando ofertas.');
    }

    // Transação para criar a oferta e adicionar o prestador à conversa
    return this.prisma.$transaction(async (tx) => {
      const offer = await tx.offer.create({
        data: { ...createOfferDto, orderId, providerId },
      });

      const conversation = await tx.conversation.findUnique({
        where: { orderId: order.id },
      });

      if (!conversation) {
        // Isso não deve acontecer se a lógica de criação de pedido estiver correta
        throw new InternalServerErrorException('Conversa para este pedido não encontrada.');
      }

      // Adiciona o prestador como participante (ignora se ele já for um)
      await tx.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId: conversation.id, userId: providerId } },
        update: {},
        create: { conversationId: conversation.id, userId: providerId },
      });

      // Notifica o cliente sobre a nova oferta
      await this.notificationsService.create(
        order.clientId,
        `Você recebeu uma nova oferta para "${order.request.title}"!`,
        `/orders/${order.id}`, // Link para a página do pedido
      );

      return offer;
    });
  }
}