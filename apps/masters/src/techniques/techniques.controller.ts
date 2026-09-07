import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TechniquesService } from './techniques.service';

interface TechniqueListPayload {
  page?: number;
  limit?: number;
  search?: string;
}

@Controller()
export class TechniquesController {
  constructor(private readonly techniquesService: TechniquesService) {}

  @MessagePattern({ cmd: 'get-techniques' })
  getTechniques(@Payload() data: TechniqueListPayload) {
    return this.techniquesService.getTechniques(data.page, data.limit, {
      search: data.search,
    });
  }

  @MessagePattern({ cmd: 'get-technique-by-id' })
  getTechniqueById(@Payload() data: { id: string }) {
    return this.techniquesService.getTechniqueById(data.id);
  }

  @MessagePattern({ cmd: 'get-my-techniques' })
  getMyTechniques(@Payload() data: { ownerId: string }) {
    return this.techniquesService.getMyTechniques(data.ownerId);
  }

  @MessagePattern({ cmd: 'create-technique' })
  createTechnique(@Payload() data: { ownerId: string; payload: any }) {
    return this.techniquesService.createTechnique(data.ownerId, data.payload);
  }

  @MessagePattern({ cmd: 'update-technique' })
  updateTechnique(
    @Payload() data: { ownerId: string; id: string; payload: any },
  ) {
    return this.techniquesService.updateTechnique(
      data.ownerId,
      data.id,
      data.payload,
    );
  }

  @MessagePattern({ cmd: 'delete-technique' })
  deleteTechnique(@Payload() data: { ownerId: string; id: string }) {
    return this.techniquesService.deleteTechnique(data.ownerId, data.id);
  }

  @MessagePattern({ cmd: 'get-technique-busy-dates' })
  getTechniqueBusyDates(@Payload() data: { techniqueId: string }) {
    return this.techniquesService.getBusyDatesForTechnique(data.techniqueId);
  }
}
