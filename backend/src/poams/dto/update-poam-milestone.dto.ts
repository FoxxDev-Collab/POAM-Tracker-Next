import { IsString, IsOptional, IsInt, IsEnum, IsNumber } from 'class-validator';
import { PoamMilestoneStatus, PoamMilestoneType } from '@prisma/client';

export class UpdatePoamMilestoneDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  targetDate?: string;

  @IsOptional()
  @IsString()
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
}
