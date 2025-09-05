import { IsString, IsOptional, IsInt, IsEnum, IsNumber } from 'class-validator';
import {
  PoamSeverity,
  PoamStatus,
  PoamPriority,
  ResidualRiskLevel,
} from '@prisma/client';

export class UpdatePoamDto {
  @IsOptional()
  @IsInt()
  groupId?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  weaknessDescription?: string;

  @IsOptional()
  @IsString()
  nistControlId?: string;

  @IsOptional()
  @IsEnum(PoamSeverity)
  severity?: PoamSeverity;

  @IsOptional()
  @IsEnum(PoamStatus)
  status?: PoamStatus;

  @IsOptional()
  @IsEnum(PoamPriority)
  priority?: PoamPriority;

  @IsOptional()
  @IsEnum(ResidualRiskLevel)
  residualRiskLevel?: ResidualRiskLevel;

  @IsOptional()
  @IsString()
  targetCompletionDate?: string;

  @IsOptional()
  @IsString()
  actualCompletionDate?: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  actualCost?: number;

  @IsOptional()
  @IsString()
  pocName?: string;

  @IsOptional()
  @IsString()
  pocEmail?: string;

  @IsOptional()
  @IsString()
  pocPhone?: string;

  @IsOptional()
  @IsInt()
  assignedTeamId?: number;
}
