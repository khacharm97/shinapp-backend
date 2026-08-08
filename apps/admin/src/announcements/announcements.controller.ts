import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AnnouncementsService } from './announcements.service';

@Controller()
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @MessagePattern({ cmd: 'admin.get_announcements' })
  async getAnnouncements() {
    try {
      return await this.announcementsService.getAnnouncements();
    } catch (e) {
      return { error: e.message || 'Failed to fetch announcements' };
    }
  }

  @MessagePattern({ cmd: 'admin.create_announcement' })
  async createAnnouncement(data: any) {
    try {
      return await this.announcementsService.createAnnouncement(data);
    } catch (e) {
      return { error: e.message || 'Failed to create announcement' };
    }
  }

  @MessagePattern({ cmd: 'admin.update_announcement' })
  async updateAnnouncement(data: { id: string; payload: any }) {
    try {
      return await this.announcementsService.updateAnnouncement(data.id, data.payload);
    } catch (e) {
      return { error: e.message || 'Failed to update announcement' };
    }
  }

  @MessagePattern({ cmd: 'admin.delete_announcement' })
  async deleteAnnouncement(data: { id: string }) {
    try {
      return await this.announcementsService.deleteAnnouncement(data.id);
    } catch (e) {
      return { error: e.message || 'Failed to delete announcement' };
    }
  }
}
