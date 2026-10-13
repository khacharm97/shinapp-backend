import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConversationStatus, ConversationType } from '@prisma/client';
import { ChatService } from './chat.service';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern({ cmd: 'chat.create-guest' })
  createGuest() {
    return this.chatService.createGuest();
  }

  @MessagePattern({ cmd: 'chat.list-conversations' })
  listConversations(@Payload() data: { userId: string; type?: ConversationType }) {
    return this.chatService.listConversations(data.userId, data.type);
  }

  @MessagePattern({ cmd: 'chat.get-conversation' })
  getConversation(@Payload() data: { userId: string; conversationId: string }) {
    return this.chatService.getConversation(data.userId, data.conversationId);
  }

  @MessagePattern({ cmd: 'chat.get-messages' })
  getMessages(
    @Payload()
    data: { userId: string; conversationId: string; cursor?: string; limit?: number },
  ) {
    return this.chatService.getMessages(
      data.userId,
      data.conversationId,
      data.cursor,
      data.limit,
    );
  }

  @MessagePattern({ cmd: 'chat.send-message' })
  sendMessage(
    @Payload()
    data: {
      senderId: string;
      conversationId?: string;
      recipientId?: string;
      type?: ConversationType;
      announcementId?: string;
      orderId?: string;
      body: string;
      attachments?: string[];
    },
  ) {
    return this.chatService.sendMessage(data);
  }

  @MessagePattern({ cmd: 'chat.mark-read' })
  markRead(@Payload() data: { userId: string; conversationId: string }) {
    return this.chatService.markRead(data.userId, data.conversationId);
  }

  @MessagePattern({ cmd: 'chat.unread-count' })
  getUnreadCount(@Payload() data: { userId: string }) {
    return this.chatService.getUnreadCount(data.userId);
  }

  @MessagePattern({ cmd: 'chat.set-conversation-status' })
  setConversationStatus(
    @Payload() data: { userId: string; conversationId: string; status: ConversationStatus },
  ) {
    return this.chatService.setConversationStatus(data.userId, data.conversationId, data.status);
  }
}
