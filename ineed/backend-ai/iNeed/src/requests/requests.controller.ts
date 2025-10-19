import { Controller, Get, Query } from '@nestjs/common';
import { RequestsService } from '../modules/requests/requests.service';
import { QueryRequestDto } from './dto/query-request.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class QueryValidatedDto {
  @ValidateNested()
  @Type(() => QueryRequestDto)
  params!: QueryRequestDto;
}

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  async findAll(@Query() query: QueryRequestDto) {
    // query.lat/lng/radius/category/type já chegam transformados pelo class-transformer
    return this.requestsService.findAll(query);
  }
}