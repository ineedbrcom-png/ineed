import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: any) {
    // req.user vem do JwtStrategy.validate()
    return {
      ok: true,
      userId: req.user?.userId ?? null,
      email: req.user?.email ?? null,
    };
  }
}
