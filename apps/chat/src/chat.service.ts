import { Injectable, Logger } from '@nestjs/common';
import { ConversationStatus, ConversationType, Prisma, Role } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';

const PARTICIPANT_USER_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
  roles: true,
} satisfies Prisma.UserSelect;

const MESSAGE_SENDER_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

interface SendMessageInput {
  senderId: string;
  conversationId?: string;
  recipientId?: string;
  type?: ConversationType;
  announcementId?: string;
  orderId?: string;
  body: string;
  attachments?: string[];
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async unreadForParticipant(conversationId: string, userId: string, lastReadAt: Date | null) {
    return this.prisma.message.count({
      where: {
        conversationId,
        senderId: { not: userId },
        ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
      },
    });
  }

  private async isAdmin(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { roles: true } });
    return !!user?.roles.includes(Role.ADMIN);
  }

  /**
   * A not-logged-in visitor writing to support gets a throwaway guest account
   * so the rest of chat (participants, messages, sockets, the admin inbox)
   * works exactly as it does for a real user. No roles, no credentials.
   */
  async createGuest() {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return this.prisma.user.create({
      data: { name: `Guest ${suffix}`, isGuest: true, roles: [] },
      select: { id: true, name: true },
    });
  }

  async listConversations(userId: string, type?: ConversationType) {
    const memberships = await this.prisma.conversationParticipant.findMany({
      where: { userId, ...(type ? { conversation: { type } } : {}) },
      include: {
        conversation: {
          include: {
            participants: { include: { user: { select: PARTICIPANT_USER_SELECT } } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
      orderBy: { conversation: { lastMessageAt: 'desc' } },
    });

    return Promise.all(
      memberships.map(async (m) => {
        const others = m.conversation.participants
          .filter((p) => p.userId !== userId)
          .map((p) => p.user);
        return {
          id: m.conversation.id,
          type: m.conversation.type,
          status: m.conversation.status,
          announcementId: m.conversation.announcementId,
          orderId: m.conversation.orderId,
          lastMessageAt: m.conversation.lastMessageAt,
          otherParticipants: others,
          lastMessage: m.conversation.messages[0] ?? null,
          unreadCount: await this.unreadForParticipant(m.conversationId, userId, m.lastReadAt),
        };
      }),
    );
  }

  async getConversation(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { userId } } },
      include: {
        participants: { include: { user: { select: PARTICIPANT_USER_SELECT } } },
      },
    });
    if (!conversation) return { error: 'Conversation not found' };

    const me = conversation.participants.find((p) => p.userId === userId);
    return {
      id: conversation.id,
      type: conversation.type,
      status: conversation.status,
      announcementId: conversation.announcementId,
      orderId: conversation.orderId,
      lastMessageAt: conversation.lastMessageAt,
      otherParticipants: conversation.participants
        .filter((p) => p.userId !== userId)
        .map((p) => p.user),
      unreadCount: await this.unreadForParticipant(conversationId, userId, me?.lastReadAt ?? null),
    };
  }

  async getMessages(userId: string, conversationId: string, cursor?: string, limit = 30) {
    const isParticipant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!isParticipant) return { error: 'Conversation not found' };

    const take = Math.min(Math.max(limit, 1), 100);
    // Fetch newest-first for pagination, then return chronological order.
    const rows = await this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: MESSAGE_SENDER_SELECT } },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > take;
    const page = hasMore ? rows.slice(0, take) : rows;
    return {
      items: page.reverse(),
      nextCursor: hasMore ? page[0].id : null,
    };
  }

  /**
   * A support conversation has no single recipient — it's a shared inbox
   * between the customer and whichever admins existed when it was opened.
   * A Resolved conversation is left alone (admins keep it for history) and
   * the next message starts a fresh one instead of reopening it.
   */
  private async findOrCreateSupportConversation(senderId: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: {
        type: ConversationType.SUPPORT,
        status: ConversationStatus.OPEN,
        participants: { some: { userId: senderId } },
      },
      include: { participants: true },
    });
    if (existing) return existing;

    const admins = await this.prisma.user.findMany({
      where: { roles: { has: Role.ADMIN }, id: { not: senderId } },
      select: { id: true },
    });

    return this.prisma.conversation.create({
      data: {
        type: ConversationType.SUPPORT,
        participants: {
          create: [senderId, ...admins.map((a) => a.id)].map((userId) => ({ userId })),
        },
      },
      include: { participants: true },
    });
  }

  private async findOrCreateConversation(input: SendMessageInput) {
    const type = input.type ?? ConversationType.USER_MASTER;
    if (type === ConversationType.SUPPORT && !input.recipientId) {
      return this.findOrCreateSupportConversation(input.senderId);
    }

    const existing = await this.prisma.conversation.findFirst({
      where: {
        type,
        announcementId: input.announcementId ?? null,
        orderId: input.orderId ?? null,
        AND: [
          { participants: { some: { userId: input.senderId } } },
          { participants: { some: { userId: input.recipientId } } },
        ],
      },
      include: { participants: true },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        type,
        announcementId: input.announcementId ?? null,
        orderId: input.orderId ?? null,
        participants: {
          create: [{ userId: input.senderId }, { userId: input.recipientId! }],
        },
      },
      include: { participants: true },
    });
  }

  async sendMessage(input: SendMessageInput) {
    const body = (input.body ?? '').trim();
    if (!body) return { error: 'Message body is required' };
    if (body.length > 4000) return { error: 'Message is too long' };

    let conversation;
    if (input.conversationId) {
      conversation = await this.prisma.conversation.findFirst({
        where: { id: input.conversationId, participants: { some: { userId: input.senderId } } },
        include: { participants: true },
      });
      if (!conversation) return { error: 'Conversation not found' };
    } else {
      const isSupport = (input.type ?? ConversationType.USER_MASTER) === ConversationType.SUPPORT;
      if (!isSupport) {
        if (!input.recipientId) return { error: 'recipientId is required for a new conversation' };
        if (input.recipientId === input.senderId) return { error: 'Cannot message yourself' };
      } else if (input.recipientId === input.senderId) {
        return { error: 'Cannot message yourself' };
      }
      conversation = await this.findOrCreateConversation(input);
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: input.senderId,
        body,
        attachments: input.attachments ?? [],
      },
      include: { sender: { select: MESSAGE_SENDER_SELECT } },
    });

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: message.createdAt },
    });
    // The sender has implicitly read up to their own message.
    await this.prisma.conversationParticipant.updateMany({
      where: { conversationId: conversation.id, userId: input.senderId },
      data: { lastReadAt: message.createdAt },
    });

    return {
      message,
      conversationId: conversation.id,
      conversationType: conversation.type,
      conversationStatus: conversation.status,
      participantIds: conversation.participants.map((p) => p.userId),
    };
  }

  async setConversationStatus(userId: string, conversationId: string, status: ConversationStatus) {
    if (!(await this.isAdmin(userId))) {
      return { error: 'Only support agents can change conversation status' };
    }
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, type: ConversationType.SUPPORT, participants: { some: { userId } } },
    });
    if (!conversation) return { error: 'Conversation not found' };

    await this.prisma.conversation.update({ where: { id: conversationId }, data: { status } });
    return { success: true, status };
  }

  async markRead(userId: string, conversationId: string) {
    const result = await this.prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() },
    });
    if (result.count === 0) return { error: 'Conversation not found' };
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const memberships = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true, lastReadAt: true },
    });
    const counts = await Promise.all(
      memberships.map((m) => this.unreadForParticipant(m.conversationId, userId, m.lastReadAt)),
    );
    return { count: counts.reduce((sum, c) => sum + c, 0) };
  }
}
