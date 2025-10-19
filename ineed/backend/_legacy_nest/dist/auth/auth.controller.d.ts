import { AuthService } from './auth.service';
import { FirebaseBridgeService } from './firebase-bridge.service';
import { ExchangeDto } from './dto/exchange.dto';
export declare class AuthController {
    private readonly auth;
    private readonly fb;
    constructor(auth: AuthService, fb: FirebaseBridgeService);
    exchange(dto: ExchangeDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
