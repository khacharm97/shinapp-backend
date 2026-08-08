import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Inject,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto';
import { UpdateAnnouncementDto } from '../dto/update-announcement.dto';

@ApiExcludeController()
@Controller('admin/announcements')
export class AdminAnnouncementsController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAnnouncements() {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.get_announcements' }, {}),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createAnnouncement(@Body() data: CreateAnnouncementDto) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.create_announcement' }, data),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateAnnouncement(
    @Param('id') id: string,
    @Body() payload: UpdateAnnouncementDto,
  ) {
    const result = await firstValueFrom(
      this.adminClient.send(
        { cmd: 'admin.update_announcement' },
        { id, payload },
      ),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteAnnouncement(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.delete_announcement' }, { id }),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }
}
