import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    orderId: string,
    authorId: string,
    createReviewDto: CreateReviewDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    if (order.status !== 'Concluído') {
      throw new BadRequestException('Só é possível avaliar pedidos concluídos.');
    }

    if (!order.providerId) {
      throw new BadRequestException('O pedido não teve um prestador associado.');
    }

    const isClient = order.clientId === authorId;
    const isProvider = order.providerId === authorId;

    if (!isClient && !isProvider) {
      throw new ForbiddenException(
        'Você não participou deste pedido e não pode avaliá-lo.',
      );
    }

    const recipientId = isClient ? order.providerId : order.clientId;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Cria a avaliação
        const review = await tx.review.create({
          data: {
            ...createReviewDto,
            orderId,
            authorId,
            recipientId,
          },
        });

        // 2. Atualiza a média e contagem de avaliações do usuário que a recebeu
        // Usamos uma raw query para garantir o cálculo atômico e evitar race conditions.
        await tx.$executeRaw`
          UPDATE "users"
          SET 
            rating_count = rating_count + 1,
            avg_rating = ((avg_rating * rating_count) + ${createReviewDto.rating}) / (rating_count + 1)
          WHERE id = ${recipientId}::uuid
        `;

        return review;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Você já avaliou este pedido.');
      }
      throw error;
    }
  }
}