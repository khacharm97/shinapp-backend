import { Controller } from '@nestjs/common';
import { AdminService } from './admin.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @MessagePattern({ cmd: 'admin.login' })
  async login(data: any) {
    try {
      const result = await this.adminService.login(data);
      return result;
    } catch (e) {
      return { error: e.message || 'Login failed' };
    }
  }

  @MessagePattern({ cmd: 'admin.get_users' })
  async getUsers() {
    try {
      const users = await this.adminService.getUsers();
      return users;
    } catch (e) {
      return { error: e.message || 'Failed to fetch users' };
    }
  }

  @MessagePattern({ cmd: 'admin.get_contact_requests' })
  async getContactRequests() {
    try {
      return await this.adminService.getContactRequests();
    } catch (e) {
      return { error: e.message || 'Failed to fetch contact requests' };
    }
  }

  @MessagePattern({ cmd: 'admin.create_contact_request' })
  async createContactRequest(data: any) {
    try {
      return await this.adminService.createContactRequest(data);
    } catch (e) {
      return { error: e.message || 'Failed to create contact request' };
    }
  }

  @MessagePattern({ cmd: 'admin.update_contact_request' })
  async updateContactRequest(data: { email: string; payload: any }) {
    try {
      return await this.adminService.updateContactRequest(data.email, data.payload);
    } catch (e) {
      return { error: e.message || 'Failed to update contact request' };
    }
  }

  @MessagePattern({ cmd: 'admin.contact_request_exists' })
  async contactRequestExists(data: { email: string }) {
    try {
      return await this.adminService.contactRequestExists(data.email);
    } catch (e) {
      return { error: e.message || 'Failed to check contact request' };
    }
  }

  @MessagePattern({ cmd: 'admin.mark_contact_request_read' })
  async markContactRequestAsRead(data: { id: string }) {
    try {
      return await this.adminService.markContactRequestAsRead(data.id);
    } catch (e) {
      return { error: e.message || 'Failed to mark as read' };
    }
  }
}
