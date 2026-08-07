import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Inject,
  UseGuards,
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('admin')
export class AdminGatewayController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
  ) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.login' }, loginDto),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getUsers() {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.get_users' }, {}),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.get_user_by_id' }, { id }),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:id/block')
  async toggleBlockUser(
    @Param('id') id: string,
    @Body() data: { isBlocked: boolean },
  ) {
    const result = await firstValueFrom(
      this.adminClient.send(
        { cmd: 'admin.toggle_block_user' },
        { id, isBlocked: data.isBlocked },
      ),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:id/verify')
  async toggleVerifyUser(
    @Param('id') id: string,
    @Body() data: { isVerified: boolean },
  ) {
    const result = await firstValueFrom(
      this.adminClient.send(
        { cmd: 'admin.toggle_verify_user' },
        { id, isVerified: data.isVerified },
      ),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('contact-requests')
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
  @Put('contact-requests/:id/read')
  async markContactRequestRead(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.mark_contact_request_read' }, { id }),
    );
    if (result && result.error) {
      throw new UnauthorizedException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('skills')
  async getAllSkills() {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.get_all_skills' }, {}),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('skills')
  async createSkill(@Body() data: any) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.create_skill' }, data),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put('skills/:id')
  async updateSkill(@Param('id') id: string, @Body() payload: any) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.update_skill' }, { id, payload }),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('skills/:id')
  async deleteSkill(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.delete_skill' }, { id }),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }
}
