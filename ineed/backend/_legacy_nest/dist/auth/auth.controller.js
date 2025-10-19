"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const firebase_bridge_service_1 = require("./firebase-bridge.service");
const exchange_dto_1 = require("./dto/exchange.dto");
let AuthController = class AuthController {
    auth;
    fb;
    constructor(auth, fb) {
        this.auth = auth;
        this.fb = fb;
    }
    async exchange(dto) {
        const decoded = await this.fb.verifyIdToken(dto.idToken);
        const payload = { sub: decoded.uid, email: decoded.email ?? null };
        return this.auth.issueTokens(payload);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('exchange'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exchange_dto_1.ExchangeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "exchange", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        firebase_bridge_service_1.FirebaseBridgeService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map