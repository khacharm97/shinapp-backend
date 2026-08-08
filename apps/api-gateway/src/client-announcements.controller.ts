import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { Roles } from './common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateMyAnnouncementDto } from './dto/create-my-announcement.dto';
import { UpdateMyAnnouncementDto } from './dto/update-my-announcement.dto';

@ApiTags('Client Announcements')
@Controller('auth/profile/announcements')
export class ClientAnnouncementsController {
  constructor(
    @Inject('MASTERS_SERVICE') private readonly mastersClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current company announcements' })
  async getMyAnnouncements(@Request() req) {
    const result = await firstValueFrom(
      this.mastersClient.send({ cmd: 'masters.get_my_announcements' }, { companyId: req.user.id }),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an announcement' })
  async createAnnouncement(@Request() req, @Body() body: CreateMyAnnouncementDto) {
    const payload = { ...body };
    const result = await firstValueFrom(
      this.mastersClient.send({ cmd: 'masters.create_my_announcement' }, { companyId: req.user.id, payload }),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an announcement' })
  async updateAnnouncement(
    @Request() req,
    @Param('id') id: string,
    @Body() body: UpdateMyAnnouncementDto,
  ) {
    const result = await firstValueFrom(
      this.mastersClient.send(
        { cmd: 'masters.update_my_announcement' },
        { id, payload: body, companyId: req.user.id },
      ),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an announcement' })
  async deleteAnnouncement(@Request() req, @Param('id') id: string) {
    const result = await firstValueFrom(
      this.mastersClient.send(
        { cmd: 'masters.delete_my_announcement' },
        { id, companyId: req.user.id },
      ),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }
}
