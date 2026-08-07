import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_key',
    });
  }

  async validate(payload: any) {
    const result = await firstValueFrom(
      this.authClient.send({ cmd: 'auth.check_blocked' }, { id: payload.sub }),
    );
    if (result && result.isBlocked) {
      throw new ForbiddenException('auth_error_user_blocked');
    }
    return { id: payload.sub, roles: payload.roles };
  }
}
