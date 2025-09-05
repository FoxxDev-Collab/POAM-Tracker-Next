import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { StpStatus, StpPriority } from '@prisma/client';

export class CreateStpDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  systemId: number;

  @IsInt()
  packageId: number;

  @IsOptional()
  @IsEnum(StpStatus)
  status?: StpStatus;

  @IsOptional()
  @IsEnum(StpPriority)
  priority?: StpPriority;

  @IsOptional()
  @IsInt()
  assignedTeamId?: number;

  @IsInt()
  createdBy: number;

  @IsOptional()
  @IsString()
  dueDate?: string;
}
