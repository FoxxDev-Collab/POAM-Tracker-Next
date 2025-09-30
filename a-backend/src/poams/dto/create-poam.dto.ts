import { IsString, IsOptional, IsInt, IsEnum, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import {
  PoamSeverity,
  PoamStatus,
  PoamPriority,
  ResidualRiskLevel,
  ThreatLevel,
  RiskLikelihood,
  RiskImpact,
  ApprovalStatus,
} from '@prisma/client';

export class CreatePoamDto {
  @IsInt()
  packageId: number;

  @IsOptional()
  @IsInt()
  groupId?: number;

  @IsString()
  poamNumber: string;

  @IsString()
  title: string;

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

  // Risk Management Fields
  @IsOptional()
  @IsNumber()
  inherentRiskScore?: number;

  @IsOptional()
  @IsNumber()
  residualRiskScore?: number;

  @IsOptional()
  @IsEnum(ResidualRiskLevel)
  residualRiskLevel?: ResidualRiskLevel;

  @IsOptional()
  @IsEnum(ThreatLevel)
  threatLevel?: ThreatLevel;

  @IsOptional()
  @IsEnum(RiskLikelihood)
  likelihood?: RiskLikelihood;

  @IsOptional()
  @IsEnum(RiskImpact)
  impact?: RiskImpact;

  @IsOptional()
  @IsString()
  riskStatement?: string;

  @IsOptional()
  @IsString()
  mitigationStrategy?: string;

  @IsOptional()
  @IsBoolean()
  riskAcceptance?: boolean;

  @IsOptional()
  @IsString()
  riskAcceptanceRationale?: string;

  // Date Fields
  @IsOptional()
  @IsDateString()
  targetCompletionDate?: string;

  @IsOptional()
  @IsDateString()
  actualCompletionDate?: string;

  @IsOptional()
  @IsDateString()
  scheduledReviewDate?: string;

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
  @IsString()
  altPocName?: string;

  @IsOptional()
  @IsString()
  altPocEmail?: string;

  @IsOptional()
  @IsString()
  altPocPhone?: string;

  @IsOptional()
  @IsInt()
  assignedTeamId?: number;

  @IsInt()
  createdBy: number;

  // STP Linking
  @IsOptional()
  stpIds?: number[];

  // Initial Milestones
  @IsOptional()
  initialMilestones?: Array<{
    title: string;
    description?: string;
    targetDate?: string;
    milestoneType?: string;
    assignedUserId?: number;
  }>;
}
