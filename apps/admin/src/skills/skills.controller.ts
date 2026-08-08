import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SkillsService } from './skills.service';

@Controller()
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @MessagePattern({ cmd: 'admin.get_all_skills' })
  async getAllSkills() {
    try {
      return await this.skillsService.getAllSkills();
    } catch (e) {
      return { error: e.message || 'Failed to fetch skills' };
    }
  }

  @MessagePattern({ cmd: 'admin.create_skill' })
  async createSkill(data: any) {
    try {
      return await this.skillsService.createSkill(data);
    } catch (e) {
      return { error: e.message || 'Failed to create skill' };
    }
  }

  @MessagePattern({ cmd: 'admin.update_skill' })
  async updateSkill(data: { id: string; payload: any }) {
    try {
      return await this.skillsService.updateSkill(data.id, data.payload);
    } catch (e) {
      return { error: e.message || 'Failed to update skill' };
    }
  }

  @MessagePattern({ cmd: 'admin.delete_skill' })
  async deleteSkill(data: { id: string }) {
    try {
      return await this.skillsService.deleteSkill(data.id);
    } catch (e) {
      return { error: e.message || 'Failed to delete skill' };
    }
  }
}
