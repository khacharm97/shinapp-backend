import {
  Controller,
  Get,
  Put,
  Param,
  Inject,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('admin/contact-requests')
export class AdminContactRequestsController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getContactRequests() {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.get_contact_requests' }, {}),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/read')
  async markContactRequestRead(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.mark_contact_request_read' }, { id }),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }
}
