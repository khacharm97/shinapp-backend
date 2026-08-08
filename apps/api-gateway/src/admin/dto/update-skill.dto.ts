import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSkillDto {
  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

  @IsString()
  @IsOptional()
  nameAm?: string;

  @IsString()
  @IsOptional()
  nameRu?: string;

  @IsString()
  @IsOptional()
  nameFa?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  approved?: boolean;
}
