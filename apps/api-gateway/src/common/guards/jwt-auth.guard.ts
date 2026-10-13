import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ALLOW_GUEST_KEY } from '../decorators/allow-guest.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  // A guest (support chat) token is a valid JWT, but it must only reach the
  // routes explicitly marked @AllowGuest() - everywhere else it is treated
  // the same as having no token at all.
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const authenticated = super.handleRequest(err, user, info, context);
    if (authenticated?.isGuest) {
      const allowGuest = this.reflector.getAllAndOverride<boolean>(
        ALLOW_GUEST_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!allowGuest) throw new UnauthorizedException();
    }
    return authenticated;
  }
}
