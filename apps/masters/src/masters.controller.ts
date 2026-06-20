import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MastersService } from './masters.service';

@Controller()
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @MessagePattern({ cmd: 'get-masters' })
  getMasters(@Payload() data: { page?: number; limit?: number }) {
    return this.mastersService.getMasters(data.page, data.limit);
  }

  @MessagePattern({ cmd: 'get-master-by-id' })
  getMasterById(@Payload() data: { id: string }) {
    return this.mastersService.getMasterById(data.id);
  }
}
