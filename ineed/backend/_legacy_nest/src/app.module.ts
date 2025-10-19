import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CompatModule } from './compat/compat.module';
import { RequestsModule } from './requests/requests.module';

@Module({
  imports: [AuthModule, UsersModule, CompatModule, RequestsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
