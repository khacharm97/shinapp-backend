import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  Inject,
  UseGuards,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ChatGateway } from './chat.gateway';
import { AllowGuest } from './common/decorators/allow-guest.decorator';
import { RateLimiter } from './common/utils/rate-limiter';

const GUEST_MESSAGES_PER_MINUTE = 15;

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  private readonly guestMessageLimiter = new RateLimiter(
    GUEST_MESSAGES_PER_MINUTE,
    60 * 1000,
  );

  constructor(
    @Inject('CHAT_SERVICE') private readonly chatService: ClientProxy,
    @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsService: ClientProxy,
    private readonly chatGateway: ChatGateway,
  ) {}

  @AllowGuest()
  @Get('conversations')
  async listConversations(
    @Request() req,
    @Query('type') type?: 'USER_MASTER' | 'MASTER_COMPANY' | 'SUPPORT',
  ) {
    return firstValueFrom(
      this.chatService.send({ cmd: 'chat.list-conversations' }, { userId: req.user.id, type }),
    );
  }

  @AllowGuest()
  @Get('unread-count')
  async unreadCount(@Request() req) {
    return firstValueFrom(
      this.chatService.send({ cmd: 'chat.unread-count' }, { userId: req.user.id }),
    );
  }

  @Get('conversations/:id')
  async getConversation(@Request() req, @Param('id') id: string) {
    const result = await firstValueFrom(
      this.chatService.send(
        { cmd: 'chat.get-conversation' },
        { userId: req.user.id, conversationId: id },
      ),
    );
    if (result?.error) throw new BadRequestException(result.error);
    return result;
  }

  @AllowGuest()
  @Get('conversations/:id/messages')
  async getMessages(
    @Request() req,
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await firstValueFrom(
      this.chatService.send(
        { cmd: 'chat.get-messages' },
        {
          userId: req.user.id,
          conversationId: id,
          cursor,
          limit: limit ? parseInt(limit, 10) : undefined,
        },
      ),
    );
    if (result?.error) throw new BadRequestException(result.error);
    return result;
  }

  @AllowGuest()
  @Post('conversations/:id/read')
  async markRead(@Request() req, @Param('id') id: string) {
    const result = await firstValueFrom(
      this.chatService.send(
        { cmd: 'chat.mark-read' },
        { userId: req.user.id, conversationId: id },
      ),
    );
    if (result?.error) throw new BadRequestException(result.error);
    return result;
  }

  @AllowGuest()
  @Post('messages')
  async sendMessage(
    @Request() req,
    @Body()
    body: {
      conversationId?: string;
      recipientId?: string;
      type?: 'USER_MASTER' | 'MASTER_COMPANY' | 'SUPPORT';
      announcementId?: string;
      orderId?: string;
      body: string;
      attachments?: string[];
    },
  ) {
    // A guest can only ever talk to support: drop anything that would start
    // a conversation with a specific user or attach files.
    let payload = body;
    if (req.user.isGuest) {
      if (!this.guestMessageLimiter.take(req.user.id)) {
        throw new HttpException(
          'Too many requests',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      payload = {
        conversationId: body.conversationId,
        type: 'SUPPORT',
        body: body.body,
      };
    }

    const result = await firstValueFrom(
      this.chatService.send(
        { cmd: 'chat.send-message' },
        { senderId: req.user.id, ...payload },
      ),
    );
    if (result?.error) throw new BadRequestException(result.error);

    const { message, conversationId, conversationStatus, participantIds } = result;

    // Real-time fan-out to connected participants.
    this.chatGateway.emitMessage(participantIds, message, conversationId, conversationStatus);

    // Offline participants get a bell/push notification instead.
    const recipients: string[] = participantIds.filter(
      (pid: string) => pid !== req.user.id,
    );
    for (const recipientId of recipients) {
      if (await this.chatGateway.isOnline(recipientId)) continue;
      const preview =
        message.body.length > 140 ? `${message.body.slice(0, 140)}…` : message.body;
      this.notificationsService.emit(
        { cmd: 'create-notification' },
        {
          userId: recipientId,
          type: 'MESSAGE',
          title: message.sender?.name || 'New message',
          message: preview,
          metadata: { conversationId, messageId: message.id },
        },
      );
    }

    return result;
  }

  @Post('conversations/:id/status')
  async setConversationStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { status: 'OPEN' | 'RESOLVED' },
  ) {
    const result = await firstValueFrom(
      this.chatService.send(
        { cmd: 'chat.set-conversation-status' },
        { userId: req.user.id, conversationId: id, status: body.status },
      ),
    );
    if (result?.error) throw new BadRequestException(result.error);
    return result;
  }
}
