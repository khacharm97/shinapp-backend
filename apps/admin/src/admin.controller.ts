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

  @MessagePattern({ cmd: 'admin.get_user_by_id' })
  async getUserById(data: { id: string }) {
    try {
      return await this.adminService.getUserById(data.id);
    } catch (e) {
      return { error: e.message || 'Failed to fetch user' };
    }
  }

  @MessagePattern({ cmd: 'admin.toggle_block_user' })
  async toggleBlockUser(data: { id: string; isBlocked: boolean }) {
    try {
      return await this.adminService.toggleBlockUser(data.id, data.isBlocked);
    } catch (e) {
      return { error: e.message || 'Failed to block/unblock user' };
    }
  }

  @MessagePattern({ cmd: 'admin.toggle_verify_user' })
  async toggleVerifyUser(data: { id: string; isVerified: boolean }) {
    try {
      return await this.adminService.toggleVerifyUser(data.id, data.isVerified);
    } catch (e) {
      return { error: e.message || 'Failed to verify/unverify user' };
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
      return await this.adminService.updateContactRequest(
        data.email,
        data.payload,
      );
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

  @MessagePattern({ cmd: 'admin.get_all_skills' })
  async getAllSkills() {
    try {
      return await this.adminService.getAllSkills();
    } catch (e) {
      return { error: e.message || 'Failed to fetch skills' };
    }
  }

  @MessagePattern({ cmd: 'admin.create_skill' })
  async createSkill(data: any) {
    try {
      return await this.adminService.createSkill(data);
    } catch (e) {
      return { error: e.message || 'Failed to create skill' };
    }
  }

  @MessagePattern({ cmd: 'admin.update_skill' })
  async updateSkill(data: { id: string; payload: any }) {
    try {
      return await this.adminService.updateSkill(data.id, data.payload);
    } catch (e) {
      return { error: e.message || 'Failed to update skill' };
    }
  }

  @MessagePattern({ cmd: 'admin.delete_skill' })
  async deleteSkill(data: { id: string }) {
    try {
      return await this.adminService.deleteSkill(data.id);
    } catch (e) {
      return { error: e.message || 'Failed to delete skill' };
    }
  }
}
