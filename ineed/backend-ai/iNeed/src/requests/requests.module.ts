import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsService } from '../modules/requests/requests.service';
import { PrismaService } from '@/infra/prisma/prisma.service';

@Module({
  controllers: [RequestsController],
  providers: [RequestsService, PrismaService],
  exports: [RequestsService],
})
export class RequestsModule {}