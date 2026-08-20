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
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { R2StorageService } from '../../r2-storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { ToggleBlockUserDto, ToggleVerifyUserDto } from '../dto/toggle-user-status.dto';
import { CreateUserDto } from '../dto/create-user.dto';

@ApiExcludeController()
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly r2StorageService: R2StorageService,
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

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.update_user' }, { ...data, id }),
    );
    if (result && result.error) {
      throw new BadRequestException(result.error);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/portfolios')
  @UseInterceptors(FilesInterceptor('images', 3))
  async createPortfolio(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const uploadPromises = files.map((file) =>
      this.r2StorageService.uploadFile(file, 'portfolios'),
    );
    const imageUrls = await Promise.all(uploadPromises);

    const portfolioData = {
      title: body.title,
      description: body.description,
      imageUrls,
    };

    const result = await firstValueFrom(
      this.authClient.send(
        { cmd: 'create-portfolio' },
        { userId: id, portfolioData },
      ),
    );
    if (result && result.error) throw new BadRequestException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/portfolios/:portfolioId')
  async deletePortfolio(
    @Param('id') id: string,
    @Param('portfolioId') portfolioId: string,
  ) {
    const result = await firstValueFrom(
      this.authClient.send(
        { cmd: 'delete-portfolio' },
        { userId: id, portfolioId },
      ),
    );
    if (result && result.error) throw new BadRequestException(result.error);
    return result;
  }
}
