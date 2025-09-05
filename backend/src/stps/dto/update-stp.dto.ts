import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { StpStatus, StpPriority } from '@prisma/client';

export class UpdateStpDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(StpStatus)
  status?: StpStatus;

  @IsOptional()
  @IsEnum(StpPriority)
  priority?: StpPriority;

  @IsOptional()
  @IsInt()
  assignedTeamId?: number;

  @IsOptional()
  @IsString()
  dueDate?: string;
}
