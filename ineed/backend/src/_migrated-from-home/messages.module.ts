import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  providers: [MessagesGateway, PrismaService],
})
export class MessagesModule {}