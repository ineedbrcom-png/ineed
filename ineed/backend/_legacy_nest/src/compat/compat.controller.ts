import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('compat')
@Controller('compat')
export class CompatController {
  @Get('ping')
  ping() {
    return {
      ok: true,
      service: 'ineed-backend-nest',
      time: new Date().toISOString(),
    };
  }
}
