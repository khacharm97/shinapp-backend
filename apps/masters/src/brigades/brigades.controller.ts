import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BrigadesService } from './brigades.service';

@Controller()
export class BrigadesController {
  constructor(private readonly brigadesService: BrigadesService) {}

  @MessagePattern({ cmd: 'create-brigade' })
  createBrigade(
    @Payload()
    data: {
      ownerId: string;
      name: string;
      about?: string;
      invites: string[];
    },
  ) {
    return this.brigadesService.createBrigade(data);
  }

  @MessagePattern({ cmd: 'get-brigade-by-id' })
  getBrigadeById(@Payload() data: { id: string }) {
    return this.brigadesService.getBrigadeById(data.id);
  }

  @MessagePattern({ cmd: 'get-brigades' })
  getBrigades(@Payload() data: { ownerId: string }) {
    return this.brigadesService.getBrigadesByOwnerId(data.ownerId);
  }

  @MessagePattern({ cmd: 'search-brigade-invitees' })
  searchBrigadeInvitees(
    @Payload()
    data: {
      requesterId: string;
      search: string;
      brigadeId?: string;
      limit?: number;
    },
  ) {
    return this.brigadesService.searchBrigadeInvitees(data);
  }

  @MessagePattern({ cmd: 'delete-brigade' })
  deleteBrigade(@Payload() data: { ownerId: string; brigadeId: string }) {
    return this.brigadesService.deleteBrigade(data);
  }

  @MessagePattern({ cmd: 'update-brigade' })
  updateBrigade(
    @Payload()
    data: {
      ownerId: string;
      brigadeId: string;
      name: string;
      about?: string;
      invites: string[];
      removeMemberIds: string[];
    },
  ) {
    return this.brigadesService.updateBrigade(data);
  }

  @MessagePattern({ cmd: 'accept-brigade-invite' })
  acceptBrigadeInvite(@Payload() data: { userId: string; brigadeId: string }) {
    return this.brigadesService.acceptBrigadeInvite(data);
  }

  @MessagePattern({ cmd: 'reject-brigade-invite' })
  rejectBrigadeInvite(@Payload() data: { userId: string; brigadeId: string }) {
    return this.brigadesService.rejectBrigadeInvite(data);
  }
}
