import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})], // Importa o JwtModule para o Gateway
  controllers: [NotificationsController],
  providers: [NotificationsGateway, NotificationsService, PrismaService],
  exports: [NotificationsService], // Exporta o serviço para ser usado em outros módulos
})
export class NotificationsModule {}