import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  @Get()
  @ApiQuery({ name: 'lat', required: false })
  @ApiQuery({ name: 'lng', required: false })
  @ApiQuery({ name: 'radius', required: false, description: 'metros', example: 5000 })
  list(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ) {
    // placeholder: em breve conectaremos no Postgres + PostGIS
    return {
      ok: true,
      filters: {
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        radius: radius ? Number(radius) : null,
      },
      items: [], // retornará do banco quando ligar o ORM
    };
  }
}
