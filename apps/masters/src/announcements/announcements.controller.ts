import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AnnouncementsService } from './announcements.service';

@Controller()
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @MessagePattern({ cmd: 'masters.get_public_announcements' })
  async getPublicAnnouncements(@Payload() data: { page: number; limit: number }) {
    try {
      return await this.announcementsService.getPublicAnnouncements(data.page, data.limit);
    } catch (e) {
      return { error: e.message || 'Failed to fetch public announcements' };
    }
  }

  @MessagePattern({ cmd: 'masters.get_public_announcement_by_id' })
  async getPublicAnnouncementById(@Payload() data: { id: string }) {
    try {
      return await this.announcementsService.getPublicAnnouncementById(data.id);
    } catch (e) {
      return { error: e.message || 'Failed to fetch announcement' };
    }
  }

  @MessagePattern({ cmd: 'masters.get_my_announcements' })
  async getMyAnnouncements(@Payload() data: { companyId: string }) {
    try {
      return await this.announcementsService.getMyAnnouncements(data.companyId);
    } catch (e) {
      return { error: e.message || 'Failed to fetch announcements' };
    }
  }

  @MessagePattern({ cmd: 'masters.create_my_announcement' })
  async createMyAnnouncement(@Payload() data: { companyId: string; payload: any }) {
    try {
      return await this.announcementsService.createMyAnnouncement(data.companyId, data.payload);
    } catch (e) {
      return { error: e.message || 'Failed to create announcement' };
    }
  }

  @MessagePattern({ cmd: 'masters.update_my_announcement' })
  async updateMyAnnouncement(@Payload() data: { id: string; payload: any; companyId: string }) {
    try {
      return await this.announcementsService.updateMyAnnouncement(data.companyId, data.id, data.payload);
    } catch (e) {
      return { error: e.message || 'Failed to update announcement' };
    }
  }

  @MessagePattern({ cmd: 'masters.delete_my_announcement' })
  async deleteMyAnnouncement(@Payload() data: { id: string; companyId: string }) {
    try {
      return await this.announcementsService.deleteMyAnnouncement(data.companyId, data.id);
    } catch (e) {
      return { error: e.message || 'Failed to delete announcement' };
    }
  }
}
