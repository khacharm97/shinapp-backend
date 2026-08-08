import { IsBoolean, IsOptional } from 'class-validator';

export class ToggleBlockUserDto {
  @IsBoolean()
  isBlocked: boolean;
}

export class ToggleVerifyUserDto {
  @IsBoolean()
  isVerified: boolean;
}
