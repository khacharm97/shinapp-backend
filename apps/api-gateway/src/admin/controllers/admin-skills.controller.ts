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
import { CreateSkillDto } from '../dto/create-skill.dto';
import { UpdateSkillDto } from '../dto/update-skill.dto';

@ApiExcludeController()
@Controller('admin/skills')
export class AdminSkillsController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientProxy,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllSkills() {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.get_all_skills' }, {}),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSkill(@Body() data: CreateSkillDto) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.create_skill' }, data),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateSkill(@Param('id') id: string, @Body() payload: UpdateSkillDto) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.update_skill' }, { id, payload }),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSkill(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.adminClient.send({ cmd: 'admin.delete_skill' }, { id }),
    );
    if (result && result.error) throw new UnauthorizedException(result.error);
    return result;
  }
}
