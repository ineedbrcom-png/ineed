import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cloud Run injeta PORT (ex.: 8080). Ouça em 0.0.0.0 para aceitar conexões externas.
  const port = parseInt(process.env.PORT ?? '8080', 10);
  await app.listen(port, '0.0.0.0');
  // opcional: log simples
  // console.log(`Server listening on port ${port}`);
}
bootstrap();
