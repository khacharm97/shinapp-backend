import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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
}
