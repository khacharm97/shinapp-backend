import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'admin.get_users' })
  async getUsers() {
    try {
      const users = await this.usersService.getUsers();
      return users;
    } catch (e) {
      return { error: e.message || 'Failed to fetch users' };
    }
  }

  @MessagePattern({ cmd: 'admin.get_user_by_id' })
  async getUserById(data: { id: string }) {
    try {
      return await this.usersService.getUserById(data.id);
    } catch (e) {
      return { error: e.message || 'Failed to fetch user' };
    }
  }

  @MessagePattern({ cmd: 'admin.toggle_block_user' })
  async toggleBlockUser(data: { id: string; isBlocked: boolean }) {
    try {
      return await this.usersService.toggleBlockUser(data.id, data.isBlocked);
    } catch (e) {
      return { error: e.message || 'Failed to block/unblock user' };
    }
  }

  @MessagePattern({ cmd: 'admin.toggle_verify_user' })
  async toggleVerifyUser(data: { id: string; isVerified: boolean }) {
    try {
      return await this.usersService.toggleVerifyUser(data.id, data.isVerified);
    } catch (e) {
      return { error: e.message || 'Failed to verify/unverify user' };
    }
  }

  @MessagePattern({ cmd: 'admin.create_user' })
  async createUser(data: any) {
    try {
      return await this.usersService.createUser(data);
    } catch (e) {
      return { error: e.message || 'Failed to create user' };
    }
  }
}
