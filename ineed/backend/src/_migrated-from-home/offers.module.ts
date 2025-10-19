import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule], // Importa o NotificationsModule
  controllers: [OffersController],
  providers: [OffersService, PrismaService],
})
export class OffersModule {}