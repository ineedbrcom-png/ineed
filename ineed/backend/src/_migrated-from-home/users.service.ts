import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { FilesService } from '../files/files.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  // Retorna o perfil completo para o próprio usuário (usado em /users/me)
  async findOne(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  // Retorna apenas os dados públicos de um usuário (usado em /users/{id})
  async findOnePublic(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        bio: true,
        avgRating: true,
        ratingCount: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // O Prisma ignora campos `undefined`, então não precisamos nos preocupar em verificar cada campo
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    const { passwordHash, ...result } = user;
    return result;
  }

  async updateAvatar(
    userId: string,
    fileBuffer: Buffer,
    filename: string,
    mimetype: string,
  ) {
    const avatarUrl = await this.filesService.uploadPublicFile(
      fileBuffer,
      filename,
      mimetype,
    );
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
    const { passwordHash, ...result } = user;
    return result;
  }
}