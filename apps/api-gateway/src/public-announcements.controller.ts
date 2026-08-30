import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Public Announcements')
@Controller('announcements')
export class PublicAnnouncementsController {
  constructor(
    @Inject('MASTERS_SERVICE') private readonly mastersClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all published public announcements' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPublicAnnouncements(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    
    return this.mastersClient.send(
      { cmd: 'masters.get_public_announcements' },
      { page: pageNum, limit: limitNum }
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single published announcement with company details' })
  async getPublicAnnouncementById(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.mastersClient.send(
        { cmd: 'masters.get_public_announcement_by_id' },
        { id }
      )
    );
    if (!result || result.error) {
      throw new NotFoundException(result?.error || 'Announcement not found');
    }
    return result;
  }
}
