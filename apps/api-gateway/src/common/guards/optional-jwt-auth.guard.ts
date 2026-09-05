import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Same 'jwt' strategy as JwtAuthGuard, but never rejects the request: with no
// or invalid token, req.user is simply left unset instead of throwing 401.
// Used on public endpoints that want to recognize a logged-in viewer when
// present without requiring login.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err: any, user: any) {
    return user || null;
  }
}
