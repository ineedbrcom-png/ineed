import { CanActivate, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken: string = client.handshake?.headers?.authorization?.split(' ')[1];
      // Aqui, você usaria o JwtService para verificar o token.
      // Por simplicidade, estamos apenas verificando se ele existe.
      // Uma implementação real validaria o token e anexaria o usuário ao socket.
      return Boolean(authToken);
    } catch (err) {
      return false;
    }
  }
}