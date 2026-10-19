import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

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

  // Hex color (e.g. #6823F1) for the skill badge on the home page.
  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  color?: string | null;

  @IsBoolean()
  @IsOptional()
  approved?: boolean;
}
