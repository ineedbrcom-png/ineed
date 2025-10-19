import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { QueryRequestDto } from './dto/query-request.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() createRequestDto: CreateRequestDto,
    @GetUser('id') userId: string,
  ) {
    // Nota: A lógica de upload de arquivos (multipart/form-data) seria adicionada aqui
    // com interceptors como FileInterceptor do NestJS.
    return this.requestsService.create(createRequestDto, userId);
  }

  @Get()
  findAll(@Query() query: QueryRequestDto) {
    return this.requestsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @GetUser('id') userId: string,
  ) {
    return this.requestsService.update(id, updateRequestDto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser('id') userId: string) {
    return this.requestsService.remove(id, userId);
  }
}