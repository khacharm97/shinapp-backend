import {
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RateLimiter } from './common/utils/rate-limiter';

// A visitor needs very few guest accounts; this mostly stops a script from
// filling the users table.
const GUEST_SESSIONS_PER_IP = 5;
const GUEST_SESSION_WINDOW_MS = 60 * 60 * 1000;

/**
 * Public (no login) entry point to support chat. Kept apart from
 * ChatController, which is guarded as a whole.
 */
@ApiTags('Chat')
@Controller('chat')
export class ChatGuestController {
  private readonly sessionLimiter = new RateLimiter(
    GUEST_SESSIONS_PER_IP,
    GUEST_SESSION_WINDOW_MS,
  );

  constructor(
    @Inject('CHAT_SERVICE') private readonly chatService: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  @Post('guest-session')
  @ApiOperation({
    summary: 'Start a guest support-chat session for a not-logged-in visitor',
  })
  async createGuestSession(@Request() req) {
    if (!this.sessionLimiter.take(req.ip || 'unknown')) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const guest = await firstValueFrom(
      this.chatService.send({ cmd: 'chat.create-guest' }, {}),
    );

    // `guest: true` is what restricts this token to @AllowGuest() routes.
    const token = this.jwtService.sign(
      { sub: guest.id, roles: [], guest: true },
      { expiresIn: '30d' },
    );
    return { token, user: guest };
  }
}
