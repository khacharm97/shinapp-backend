import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Inject,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { ToggleBlockUserDto, ToggleVerifyUserDto } from '../dto/toggle-user-status.dto';
import { CreateUserDto } from '../dto/create-user.dto';

@ApiExcludeController()
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
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
  @Post()
  async createUser(@Body() data: CreateUserDto) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.create_user' }, data),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.get_user_by_id' }, { id }),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/block')
  async toggleBlockUser(
    @Param('id') id: string,
    @Body() data: ToggleBlockUserDto,
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
  @Put(':id/verify')
  async toggleVerifyUser(
    @Param('id') id: string,
    @Body() data: ToggleVerifyUserDto,
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
}
