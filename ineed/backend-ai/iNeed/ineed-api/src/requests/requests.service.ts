import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import cuid from 'cuid';

/**
 * Versão compatível com o schema atual:
 * Tabela "Request" com colunas: id (PK string), title, description, lat, lng, "userId"
 * Sem coluna created_at.
 * Distância calculada via ST_DistanceSphere.
 */
@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRequestDto) {
    const id = cuid(); // ID único (string)

    const rows = await this.prisma.$queryRaw<any[]>`
      INSERT INTO "Request" (id, title, description, lat, lng, "userId")
      VALUES (${id}, ${dto.title}, ${dto.description}, ${dto.lat}, ${dto.lng}, ${dto.userId})
      RETURNING id, title, description, lat, lng, "userId"
    `;
    return rows[0];
  }

  async findNearby(q: NearbyQueryDto) {
  const lim = q.limit ?? 50;

  const rows = await this.prisma.$queryRaw<any[]>`
    SELECT
      id, title, description, lat, lng, "userId",
      ST_DistanceSphere(
        ST_MakePoint(${q.lng}::float8, ${q.lat}::float8),
        ST_MakePoint(CAST(lng AS double precision), CAST(lat AS double precision))
      ) AS distance_m
    FROM "Request"
    WHERE ST_DistanceSphere(
      ST_MakePoint(${q.lng}::float8, ${q.lat}::float8),
      ST_MakePoint(CAST(lng AS double precision), CAST(lat AS double precision))
    ) <= ${q.radius}::float8
    ORDER BY distance_m ASC, id DESC
    LIMIT ${lim};
  `;
  return rows;
}

  async findOne(id: string | number) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, description, lat, lng, "userId"
      FROM "Request"
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }
}