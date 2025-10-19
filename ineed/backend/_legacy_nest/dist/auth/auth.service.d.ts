import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private jwt;
    private cfg;
    constructor(jwt: JwtService, cfg: ConfigService);
    issueTokens(payload: Record<string, any>): {
        accessToken: string;
        refreshToken: string;
    };
}
