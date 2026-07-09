import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MastersService } from './masters.service';

@Controller()
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @MessagePattern({ cmd: 'get-masters' })
  getMasters(@Payload() data: { page?: number; limit?: number; search?: string; regionId?: string; cityId?: string; topRated?: boolean; availableNow?: boolean }) {
    const filters = {
      search: data.search,
      regionId: data.regionId,
      cityId: data.cityId,
      topRated: data.topRated,
      availableNow: data.availableNow,
    };
    return this.mastersService.getMasters(data.page, data.limit, filters);
  }

  @MessagePattern({ cmd: 'global-search' })
  globalSearch(@Payload() data: { page?: number; limit?: number; search?: string; regionId?: string; cityId?: string; topRated?: boolean; availableNow?: boolean }) {
    const filters = {
      search: data.search,
      regionId: data.regionId,
      cityId: data.cityId,
      topRated: data.topRated,
      availableNow: data.availableNow,
    };
    return this.mastersService.globalSearch(data.page, data.limit, filters);
  }

  @MessagePattern({ cmd: 'get-master-by-id' })
  getMasterById(@Payload() data: { id: string }) {
    return this.mastersService.getMasterById(data.id);
  }

  @MessagePattern({ cmd: 'get-skills' })
  getSkills(@Payload() data: { approvedOnly?: boolean }) {
    return this.mastersService.getSkills(data?.approvedOnly);
  }

  @MessagePattern({ cmd: 'suggest-skill' })
  suggestSkill(@Payload() data: { key: string; nameEn: string; nameAm: string; nameRu: string }) {
    return this.mastersService.suggestSkill(data);
  }
}
