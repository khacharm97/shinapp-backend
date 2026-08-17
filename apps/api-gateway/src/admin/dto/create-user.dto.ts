import { IsString, IsEmail, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsArray()
  @IsOptional()
  skills?: string[];

  @IsString()
  @IsOptional()
  pricingFormat?: string;

  @IsString()
  @IsOptional()
  priceValue?: string;

  @IsString()
  @IsOptional()
  about?: string;

  @IsString()
  @IsOptional()
  itn?: string;

  @IsString()
  @IsOptional()
  workersCount?: string;

  @IsString()
  @IsOptional()
  website?: string;
}
