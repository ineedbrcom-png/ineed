import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { QueryRequestDto } from './dto/query-request.dto';
import { Prisma, Request } from '@prisma/client';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createRequestDto: CreateRequestDto,
    userId: string,
  ): Promise<Request> {
    const { lat, lng, ...rest } = createRequestDto;

    // Usamos uma transação para garantir que o Pedido e a Ordem sejam criados juntos
    const newRequest = await this.prisma.$transaction(async (tx) => {
      const request = await tx.request.create({
        data: {
          ...rest,
          userId,
          // Criando o ponto de geolocalização para o PostGIS
          location: Prisma.sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`,
        },
      });

      // Conforme o plano, criamos uma 'Order' associada
      const order = await tx.order.create({
        data: {
          requestId: request.id,
          clientId: userId,
          status: 'Ativo',
        },
      });

      // Agora, criamos a Conversa e adicionamos o cliente como participante
      const conversation = await tx.conversation.create({
        data: {
          orderId: order.id,
        },
      });

      await tx.conversationParticipant.create({
        data: {
          conversationId: conversation.id,
          userId: userId, // O cliente
        },
      });

      return request;
    });

    return newRequest;
  }

  async findAll(query: QueryRequestDto): Promise<Request[]> {
    const { lat, lng, radius, category, type, q } = query;

    // Construindo a cláusula WHERE para filtros opcionais
    const whereClauses: string[] = ['r.is_active = TRUE'];
    if (category) {
      whereClauses.push(`r.category_id = '${category}'`);
    }
    if (type) {
      whereClauses.push(`r.type = '${type}'`);
    }
    if (q) {
      // Using to_tsvector for full-text search on title and description
      // Make sure you have a GIN index on this for performance:
      // CREATE INDEX requests_search_idx ON requests USING GIN (to_tsvector('portuguese', title || ' ' || description));
      whereClauses.push(`to_tsvector('portuguese', r.title || ' ' || r.description) @@ to_tsquery('portuguese', '${q.split(' ').join(' & ')}')`);
    }

    const whereString = whereClauses.join(' AND ');

    // A query PostGIS que você projetou, executada com segurança via Prisma
    const requests = await this.prisma.$queryRaw<Request[]>`
      SELECT * FROM requests r
      WHERE ST_DWithin(
        r.location,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radius}
      ) AND ${Prisma.sql([whereString])}
      ORDER BY r.created_at DESC;
    `;

    return requests;
  }

  async findOne(id: string): Promise<Request> {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
    if (!request) {
      throw new NotFoundException(`Pedido com ID "${id}" não encontrado.`);
    }
    return request;
  }

  async update(id: string, updateRequestDto: UpdateRequestDto, userId: string) {
    const request = await this.findOne(id);
    if (request.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar este pedido.');
    }

    return this.prisma.request.update({
      where: { id },
      data: updateRequestDto,
    });
  }

  async remove(id: string, userId: string) {
    const request = await this.findOne(id);
    if (request.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para remover este pedido.');
    }

    // Em vez de deletar, apenas desativamos, como planejado.
    return this.prisma.request.update({
      where: { id },
      data: { isActive: false },
    });
  }
}