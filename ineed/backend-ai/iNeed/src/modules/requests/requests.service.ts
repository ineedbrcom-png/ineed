import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { Prisma, Request } from '@prisma/client';
import { QueryRequestDto } from '../../requests/dto/query-request.dto';

type RequestListItem = {
  id: string;
  title: string;
  description: string | null;
  budget: number | null;
  createdAt: Date;
  userName: string;
  userAvatar: string | null;
  distance: number; // metros
};

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateRequestDto): Promise<Request> {
    const { lat, lng, ...rest } = dto;

    if (lat == null || lng == null) {
      throw new Error('lat e lng são obrigatórios para criar um Request');
    }

    return this.prisma.request.create({
      data: {
        ...rest,
        userId,
        lat,
        lng,
      },
    });
  }

  async findAll(query: QueryRequestDto): Promise<Request[] | RequestListItem[]> {
    const { lat, lng, radius = 5000, category, type } = query;

    // Fallback sem geolocalização: mais recentes
    if (lat == null || lng == null) {
      return this.prisma.request.findMany({
        where: {
          isActive: true,
          ...(category ? { categoryId: category } : {}),
          ...(type ? { type } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          user: { select: { name: true, avatarUrl: true } },
        },
      });
    }

    // Condições dinâmicas seguras
    const conds: Prisma.Sql[] = [Prisma.sql`r."isActive" = TRUE`];
    if (category) conds.push(Prisma.sql`r."categoryId" = ${category}`);
    if (type)     conds.push(Prisma.sql`r."type" = ${type}`);

    // Busca geoespacial: dentro do raio e ordenado por distância
    const rows = await this.prisma.$queryRaw<RequestListItem[]>`
      SELECT
        r.id,
        r.title,
        r.description,
        r.budget,
        r."createdAt",
        u.name        AS "userName",
        u."avatarUrl" AS "userAvatar",
        ST_Distance(
          r.location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) AS distance
      FROM "Request" AS r
      INNER JOIN "User" AS u ON u.id = r."userId"
      WHERE ${Prisma.join(conds, Prisma.sql` AND `)}
        AND ST_DWithin(
          r.location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radius}
        )
      ORDER BY distance ASC, r."createdAt" DESC
      LIMIT 100;
    `;

    return rows;
  }
}