import { IsString, IsOptional, IsInt, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { PoamMilestoneStatus, PoamMilestoneType } from '@prisma/client';

export class CreatePoamMilestoneDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsDateString()
  actualDate?: string;

  @IsOptional()
  @IsEnum(PoamMilestoneStatus)
  status?: PoamMilestoneStatus;

  @IsOptional()
  @IsEnum(PoamMilestoneType)
  milestoneType?: PoamMilestoneType;

  @IsOptional()
  @IsString()
  deliverables?: string;

  @IsOptional()
  @IsString()
  successCriteria?: string;

  @IsOptional()
  @IsInt()
  assignedUserId?: number;

  @IsOptional()
  @IsNumber()
  completionPercentage?: number;

  @IsOptional()
  @IsString()
  blockers?: string;

  @IsOptional()
  @IsString()
  dependencies?: string;
}
