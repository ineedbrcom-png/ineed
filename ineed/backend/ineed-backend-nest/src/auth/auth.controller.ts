import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { FirebaseBridgeService } from './firebase-bridge.service';
import { ExchangeDto } from './dto/exchange.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly fb: FirebaseBridgeService,
  ) {}

  // POST /api/v1/auth/exchange
  @Post('exchange')
  async exchange(@Body() dto: ExchangeDto) {
    const decoded = await this.fb.verifyIdToken(dto.idToken);
    // Mapeia/Upsert de usuário em Postgres virá depois; por ora, payload mínimo
    const payload = { sub: decoded.uid, email: decoded.email ?? null };
    return this.auth.issueTokens(payload);
  }

  // (Opcional) Refresh depois
  // @Post('refresh') ...
}
