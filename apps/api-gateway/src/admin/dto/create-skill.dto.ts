import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @IsString()
  @IsNotEmpty()
  nameAm: string;

  @IsString()
  @IsNotEmpty()
  nameRu: string;

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
