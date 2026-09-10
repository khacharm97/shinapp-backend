import { randomUUID } from 'crypto';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('API_GATEWAY_SERVICE') private readonly apiGatewayService: ClientProxy,
  ) {}

  async getNotifications(userId: string) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return { notifications };
    } catch (error) {
      this.logger.error(`Error getting notifications: ${error.message}`);
      return { error: 'Failed to fetch notifications' };
    }
  }

  async markNotificationRead(userId: string, notificationId: string) {
    try {
      const notification = await this.prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking notification as read: ${error.message}`);
      return { error: 'Failed to update notification' };
    }
  }

  async markAllNotificationsRead(userId: string) {
    try {
      await this.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking all notifications as read: ${error.message}`);
      return { error: 'Failed to update notifications' };
    }
  }

  async createNotification(data: { userId: string; type: NotificationType; title: string; message: string; metadata?: any }) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          metadata: data.metadata || {},
        },
      });

      // Send WS notification to API Gateway
      this.logger.log(
        `Notification ${notification.id} persisted for user ${data.userId}; emitting send-ws-notification to API gateway (${process.env.API_GATEWAY_HOST || 'localhost'}:3005)`,
      );
      this.apiGatewayService.emit({ cmd: 'send-ws-notification' }, { userId: data.userId, notification });

      return { success: true, notification };
    } catch (error) {
      this.logger.error(`Error creating notification: ${error.message}`);
      return { error: 'Failed to create notification' };
    }
  }

  /**
   * Relay a realtime-only socket event to the API gateway. Used by feature
   * services (brigades, ...) that only hold a client to this service. Nothing
   * is persisted — this is purely a WS fan-out (e.g. cache-invalidation pings).
   */
  forwardWsEvent(data: { userId: string; event: string; payload: any }) {
    this.logger.log(
      `Forwarding ws event '${data.event}' for user ${data.userId} to API gateway (${process.env.API_GATEWAY_HOST || 'localhost'}:3005)`,
    );
    this.apiGatewayService.emit({ cmd: 'send-ws-event' }, data);
    return { success: true };
  }

  /**
   * Fan-out: notify every active master when an announcement goes live.
   * Both the company-facing and admin-facing announcement services emit a
   * single lightweight event here; this service owns the recipient lookup and
   * the batched insert so that knowledge lives in one place.
   */
  async notifyMastersOfNewAnnouncement(data: {
    announcementId: string;
    title: string;
    sphere?: string;
  }) {
    try {
      const masters = await this.prisma.user.findMany({
        where: {
          roles: { has: 'MASTER' },
          verifiedAt: { not: null },
          isBlocked: false,
        },
        select: { id: true },
      });

      if (masters.length === 0) return { success: true, count: 0 };

      const batchId = randomUUID();
      const message = data.sphere
        ? `New announcement in ${data.sphere}: "${data.title}"`
        : `A new announcement was posted: "${data.title}"`;

      const i18n = {
        titleKey: 'notif_announcement_title',
        messageKey: data.sphere
          ? 'notif_announcement_message_sphere'
          : 'notif_announcement_message',
        params: { sphere: data.sphere ?? '', title: data.title },
      };

      await this.prisma.notification.createMany({
        data: masters.map((m) => ({
          userId: m.id,
          type: NotificationType.ANNOUNCEMENT,
          title: 'New announcement',
          message,
          metadata: { announcementId: data.announcementId, batchId, i18n },
        })),
      });

      // Re-read the rows we just inserted (createMany returns no records) so we
      // can push each master a real-time notification.
      const created = await this.prisma.notification.findMany({
        where: { metadata: { path: ['batchId'], equals: batchId } },
      });
      for (const notification of created) {
        this.apiGatewayService.emit(
          { cmd: 'send-ws-notification' },
          { userId: notification.userId, notification },
        );
      }

      return { success: true, count: created.length };
    } catch (error) {
      this.logger.error(
        `Error notifying masters of announcement: ${error.message}`,
      );
      return { error: 'Failed to notify masters' };
    }
  }
}
