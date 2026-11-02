import { Controller, Get, Inject, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './common/guards/optional-jwt-auth.guard';

@ApiTags('Public Announcements')
@Controller('announcements')
export class PublicAnnouncementsController {
  constructor(
    @Inject('MASTERS_SERVICE') private readonly mastersClient: ClientProxy,
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all published public announcements (description and company contacts only when logged in)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPublicAnnouncements(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const result = await firstValueFrom(
      this.mastersClient.send(
        { cmd: 'masters.get_public_announcements' },
        { page: pageNum, limit: limitNum }
      )
    );
    if (req.user || !Array.isArray(result?.items)) return result;

    // Logged out: keep what the cards show, drop the details.
    return {
      ...result,
      items: result.items.map(({ description, company, ...rest }: any) => {
        const { email, phone, ...publicCompany } = company || {};
        return { ...rest, company: company ? publicCompany : company };
      }),
    };
  }

  // Details are for logged-in users only; the list above stays public.
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single published announcement with company details (login required)' })
  async getPublicAnnouncementById(@Param('id') id: string, @Request() req: any) {
    const result = await firstValueFrom(
      this.mastersClient.send(
        { cmd: 'masters.get_public_announcement_by_id' },
        { id }
      )
    );
    if (!result || result.error) {
      throw new NotFoundException(result?.error || 'Announcement not found');
    }

    // Fire-and-forget: never let view tracking slow down or break the page load.
    this.mastersClient.emit(
      { cmd: 'masters.record_announcement_view' },
      {
        id,
        userId: req.user?.id || null,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    );

    return result;
  }
}
