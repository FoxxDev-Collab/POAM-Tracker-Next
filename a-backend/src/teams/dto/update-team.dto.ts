import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  leadUserId?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
