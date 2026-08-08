import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateMyAnnouncementDto {
  @IsString()
  @IsOptional()
  sphere?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  urgent?: boolean;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
