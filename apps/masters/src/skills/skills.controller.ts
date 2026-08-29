import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SkillsService } from './skills.service';

@Controller()
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @MessagePattern({ cmd: 'get-skills' })
  getSkills(@Payload() data: { approvedOnly?: boolean }) {
    return this.skillsService.getSkills(data?.approvedOnly);
  }

  @MessagePattern({ cmd: 'suggest-skill' })
  suggestSkill(
    @Payload()
    data: {
      key: string;
      nameEn: string;
      nameAm: string;
      nameRu: string;
      nameFa: string;
    },
  ) {
    return this.skillsService.suggestSkill(data);
  }
}
