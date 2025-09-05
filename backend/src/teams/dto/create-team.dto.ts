import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  leadUserId: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
