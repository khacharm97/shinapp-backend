import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
  Inject,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { Roles } from './common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiOperation, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { R2StorageService } from './r2-storage.service';

@ApiTags('orders')
@Controller('auth/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    @Inject('MASTERS_SERVICE') private readonly mastersService: ClientProxy,
    private readonly r2StorageService: R2StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order (invite)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async createOrder(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await this.r2StorageService.uploadFile(file, 'orders');
    }

    const payload = {
      ...body,
      imageUrl,
      initiatorId: req.user.id,
      techniqueId: body.techniqueId || undefined,
      brigadeId: body.brigadeId || undefined,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      price: body.price ? parseFloat(body.price) : null,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      privacyAccepted:
        body.privacyAccepted === 'true' || body.privacyAccepted === true,
    };

    const result = await firstValueFrom(
      this.mastersService.send({ cmd: 'create-order' }, payload),
    );

    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @Get('clients')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MASTER, Role.COMPANY)
  @ApiOperation({
    summary: 'Search users a master/company can propose an order to',
  })
  async searchOrderClients(
    @Request() req,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    return firstValueFrom(
      this.mastersService.send(
        { cmd: 'search-order-clients' },
        {
          requesterId: req.user.id,
          search: search || '',
          limit: limit ? parseInt(limit, 10) : undefined,
        },
      ),
    );
  }

  @Get('busy-days')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MASTER, Role.COMPANY)
  @ApiOperation({
    summary: "List the current master/company's manually-added busy periods",
  })
  async listBusyDays(@Request() req) {
    return firstValueFrom(
      this.mastersService.send(
        { cmd: 'list-busy-periods' },
        { masterId: req.user.id },
      ),
    );
  }

  @Post('busy-days')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MASTER, Role.COMPANY)
  @ApiOperation({
    summary: 'Manually mark a date range as busy (vacation, outside job, etc.)',
  })
  async addBusyDay(
    @Request() req,
    @Body() body: { startDate: string; endDate: string; note?: string },
  ) {
    const result: any = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'create-busy-period' },
        {
          masterId: req.user.id,
          startDate: body.startDate,
          endDate: body.endDate,
          note: body.note,
        },
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @Delete('busy-days/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MASTER, Role.COMPANY)
  @ApiOperation({
    summary:
      "Remove one of the current master/company's manually-added busy periods",
  })
  async removeBusyDay(@Request() req, @Param('id') id: string) {
    const result: any = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'delete-busy-period' },
        { masterId: req.user.id, id },
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for the current user' })
  async getMyOrders(@Request() req) {
    return firstValueFrom(
      this.mastersService.send(
        { cmd: 'get-my-orders' },
        { userId: req.user.id },
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific order by ID' })
  async getOrderById(@Request() req, @Param('id') id: string) {
    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'get-order-by-id' },
        { userId: req.user.id, orderId: id },
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Propose new terms for an order (Edit)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async updateOrder(
    @Request() req,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    let imageUrl = body.imageUrl; // keep existing if not replaced
    if (file) {
      imageUrl = await this.r2StorageService.uploadFile(file, 'orders');
    }

    const payload = {
      ...body,
      imageUrl,
      orderId: id,
      initiatorId: req.user.id, // Current user becomes the initiator of these new terms
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      price: body.price ? parseFloat(body.price) : null,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      privacyAccepted:
        body.privacyAccepted === 'true' || body.privacyAccepted === true,
    };

    const result = await firstValueFrom(
      this.mastersService.send({ cmd: 'update-order' }, payload),
    );

    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept an order' })
  async acceptOrder(@Request() req, @Param('id') id: string) {
    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'accept-order' },
        { userId: req.user.id, orderId: id },
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject an order' })
  async rejectOrder(@Request() req, @Param('id') id: string) {
    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'reject-order' },
        { userId: req.user.id, orderId: id },
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @Post(':id/assign')
  @ApiOperation({
    summary: 'Staff an accepted brigade order with specific brigade member(s)',
  })
  async assignOrderMembers(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { memberIds: string[] },
  ) {
    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'assign-order-members' },
        { ownerId: req.user.id, orderId: id, memberIds: body.memberIds || [] },
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @Post(':id/request-completion')
  @ApiOperation({ summary: 'Request completion of an order' })
  async requestOrderCompletion(@Request() req, @Param('id') id: string) {
    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'request-order-completion' },
        { userId: req.user.id, orderId: id },
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @Post(':id/accept-completion')
  @ApiOperation({ summary: 'Accept completion of an order' })
  async acceptOrderCompletion(@Request() req, @Param('id') id: string) {
    const result = await firstValueFrom(
      this.mastersService.send(
        { cmd: 'accept-order-completion' },
        { userId: req.user.id, orderId: id },
      ),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }
}
