import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Endpoint protegido para o usuário logado obter seus próprios dados
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@GetUser() user: User) {
    // O decorator GetUser extrai o usuário que foi validado pela JwtStrategy
    // A senha já foi removida pela estratégia
    return user;
  }

  // Endpoint protegido para o usuário logado atualizar seu perfil
  @UseGuards(AuthGuard('jwt'))
  @Put('me')
  updateMe(@GetUser('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Put('me/avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Arquivo não enviado.');
    }
    return this.usersService.updateAvatar(userId, file.buffer, file.originalname, file.mimetype);
  }

  // Endpoint público para obter o perfil de qualquer usuário pelo ID
  @Get(':id')
  getPublicProfile(@Param('id', ParseUUIDPipe) id: string) {
    // ParseUUIDPipe valida se o ID é um UUID válido
    return this.usersService.findOnePublic(id);
  }
}