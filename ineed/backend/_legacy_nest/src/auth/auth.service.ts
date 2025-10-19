import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {}

  issueTokens(payload: Record<string, any>) {
    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.cfg.get('JWT_EXPIRES_IN', '15m'),
    });
    const refreshToken = this.jwt.sign(payload, {
      expiresIn: this.cfg.get('JWT_REFRESH_EXPIRES_IN', '30d'),
    });
    return { accessToken, refreshToken };
  }
}
