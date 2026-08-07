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
      this.apiGatewayService.emit({ cmd: 'send-ws-notification' }, { userId: data.userId, notification });

      return { success: true, notification };
    } catch (error) {
      this.logger.error(`Error creating notification: ${error.message}`);
      return { error: 'Failed to create notification' };
    }
  }
}
