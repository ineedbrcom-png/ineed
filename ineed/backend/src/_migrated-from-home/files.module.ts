import { Module } from '@nestjs/common';
import { FilesService } from './files.service';

@Module({
  providers: [FilesService],
  exports: [FilesService], // Exporta o serviço para ser usado em outros módulos
})
export class FilesModule {}