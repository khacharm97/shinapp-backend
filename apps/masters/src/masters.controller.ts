import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MastersService } from './masters.service';

@Controller()
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @MessagePattern({ cmd: 'get-masters' })
  getMasters(
    @Payload()
    data: {
      page?: number;
      limit?: number;
      search?: string;
      regionId?: string;
      cityId?: string;
      topRated?: boolean;
      availableNow?: boolean;
    },
  ) {
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
  globalSearch(
    @Payload()
    data: {
      page?: number;
      limit?: number;
      search?: string;
      regionId?: string;
      cityId?: string;
      topRated?: boolean;
      availableNow?: boolean;
    },
  ) {
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
    return this.mastersService.suggestSkill(data);
  }

  @MessagePattern({ cmd: 'create-brigade' })
  createBrigade(@Payload() data: { ownerId: string; name: string; invites: string[] }) {
    return this.mastersService.createBrigade(data);
  }

  @MessagePattern({ cmd: 'get-brigades' })
  getBrigades(@Payload() data: { ownerId: string }) {
    return this.mastersService.getBrigadesByOwnerId(data.ownerId);
  }

  @MessagePattern({ cmd: 'delete-brigade' })
  deleteBrigade(@Payload() data: { ownerId: string; brigadeId: string }) {
    return this.mastersService.deleteBrigade(data);
  }

  // --- Announcements ---
  @MessagePattern({ cmd: 'masters.get_my_announcements' })
  async getMyAnnouncements(data: { companyId: string }) {
    try {
      return await this.mastersService.getMyAnnouncements(data.companyId);
    } catch (e) {
      return { error: e.message || 'Failed to fetch announcements' };
    }
  }

  @MessagePattern({ cmd: 'masters.create_my_announcement' })
  async createMyAnnouncement(data: { companyId: string; payload: any }) {
    try {
      return await this.mastersService.createMyAnnouncement(data.companyId, data.payload);
    } catch (e) {
      return { error: e.message || 'Failed to create announcement' };
    }
  }

  @MessagePattern({ cmd: 'masters.update_my_announcement' })
  async updateMyAnnouncement(data: { id: string; payload: any; companyId: string }) {
    try {
      return await this.mastersService.updateMyAnnouncement(data.companyId, data.id, data.payload);
    } catch (e) {
      return { error: e.message || 'Failed to update announcement' };
    }
  }

  @MessagePattern({ cmd: 'masters.delete_my_announcement' })
  async deleteMyAnnouncement(data: { id: string; companyId: string }) {
    try {
      return await this.mastersService.deleteMyAnnouncement(data.companyId, data.id);
    } catch (e) {
      return { error: e.message || 'Failed to delete announcement' };
    }
  }

  @MessagePattern({ cmd: 'update-brigade' })
  updateBrigade(@Payload() data: { ownerId: string; brigadeId: string; name: string; invites: string[]; removeMemberIds: string[] }) {
    return this.mastersService.updateBrigade(data);
  }

  @MessagePattern({ cmd: 'accept-brigade-invite' })
  acceptBrigadeInvite(@Payload() data: { userId: string; brigadeId: string }) {
    return this.mastersService.acceptBrigadeInvite(data);
  }

  @MessagePattern({ cmd: 'reject-brigade-invite' })
  rejectBrigadeInvite(@Payload() data: { userId: string; brigadeId: string }) {
    return this.mastersService.rejectBrigadeInvite(data);
  }
}
