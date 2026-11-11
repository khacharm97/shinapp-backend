import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MastersService } from './masters.service';

interface MasterListPayload {
  page?: number;
  limit?: number;
  search?: string;
  regionId?: string;
  cityId?: string;
  topRated?: boolean;
  availableNow?: boolean;
  sortBy?: 'rating';
  skills?: string[];
  minRating?: number;
  maxRating?: number;
  priceUnit?: 'daily' | 'sqm';
  minPrice?: number;
  maxPrice?: number;
}

@Controller()
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @MessagePattern({ cmd: 'get-masters' })
  getMasters(@Payload() data: MasterListPayload) {
    return this.mastersService.getMasters(data.page, data.limit, {
      search: data.search,
      regionId: data.regionId,
      cityId: data.cityId,
      topRated: data.topRated,
      availableNow: data.availableNow,
      sortBy: data.sortBy,
      skills: data.skills,
      minRating: data.minRating,
      maxRating: data.maxRating,
      priceUnit: data.priceUnit,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
    });
  }

  @MessagePattern({ cmd: 'global-search' })
  globalSearch(@Payload() data: MasterListPayload) {
    return this.mastersService.globalSearch(data.page, data.limit, {
      search: data.search,
      regionId: data.regionId,
      cityId: data.cityId,
      topRated: data.topRated,
      availableNow: data.availableNow,
      sortBy: data.sortBy,
      skills: data.skills,
      minRating: data.minRating,
      maxRating: data.maxRating,
      priceUnit: data.priceUnit,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
    });
  }

  @MessagePattern({ cmd: 'get-master-by-id' })
  getMasterById(@Payload() data: { id: string }) {
    return this.mastersService.getMasterById(data.id);
  }

  @MessagePattern({ cmd: 'get-public-user' })
  getPublicUserById(@Payload() data: { id: string }) {
    return this.mastersService.getPublicUserById(data.id);
  }
}
