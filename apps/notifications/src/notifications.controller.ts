import { Controller } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern({ cmd: 'get-notifications' })
  getNotifications(@Payload() data: { userId: string }) {
    return this.notificationsService.getNotifications(data.userId);
  }

  @MessagePattern({ cmd: 'mark-notification-read' })
  markNotificationRead(@Payload() data: { userId: string, notificationId: string }) {
    return this.notificationsService.markNotificationRead(data.userId, data.notificationId);
  }

  @MessagePattern({ cmd: 'mark-all-notifications-read' })
  markAllNotificationsRead(@Payload() data: { userId: string }) {
    return this.notificationsService.markAllNotificationsRead(data.userId);
  }

  @MessagePattern({ cmd: 'create-notification' })
  createNotification(@Payload() data: { userId: string, type: any, title: string, message: string, metadata?: any }) {
    return this.notificationsService.createNotification(data);
  }

  @MessagePattern({ cmd: 'notify-masters-new-announcement' })
  notifyMastersOfNewAnnouncement(@Payload() data: { announcementId: string, title: string, sphere?: string }) {
    return this.notificationsService.notifyMastersOfNewAnnouncement(data);
  }

  // Feature services (e.g. brigades) only hold a client to this service, so
  // realtime-only events are relayed through here to the API gateway rather
  // than every feature module wiring its own API_GATEWAY client.
  @MessagePattern({ cmd: 'send-ws-event' })
  forwardWsEvent(@Payload() data: { userId: string; event: string; payload: any }) {
    return this.notificationsService.forwardWsEvent(data);
  }
}
