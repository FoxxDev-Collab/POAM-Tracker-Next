import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import {
  RmfStep,
  SystemType,
  ImpactLevel,
  MissionCriticality,
  DataClassification,
  SecurityControlBaseline,
  AuthorizationStatus,
  ResidualRiskLevel,
  PoamStatus,
  ContinuousMonitoringStatus,
} from '@prisma/client';

export class UpdatePackageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RmfStep)
  rmfStep?: RmfStep;

  @IsOptional()
  @IsBoolean()
  categorizeComplete?: boolean;

  @IsOptional()
  @IsBoolean()
  selectComplete?: boolean;

  @IsOptional()
  @IsBoolean()
  implementComplete?: boolean;

  @IsOptional()
  @IsBoolean()
  assessComplete?: boolean;

  @IsOptional()
  @IsBoolean()
  authorizeComplete?: boolean;

  @IsOptional()
  @IsBoolean()
  monitorComplete?: boolean;

  @IsOptional()
  @IsInt()
  teamId?: number;

  @IsOptional()
  @IsString()
  systemOwner?: string;

  @IsOptional()
  @IsString()
  authorizingOfficial?: string;

  @IsOptional()
  @IsString()
  issoName?: string;

  @IsOptional()
  @IsString()
  issmName?: string;

  @IsOptional()
  @IsString()
  systemAdministrator?: string;

  @IsOptional()
  @IsString()
  networkAdministrator?: string;

  @IsOptional()
  @IsString()
  databaseAdministrator?: string;

  @IsOptional()
  @IsString()
  applicationAdministrator?: string;

  @IsOptional()
  @IsString()
  securityControlAssessor?: string;

  @IsOptional()
  @IsEnum(SystemType)
  systemType?: SystemType;

  @IsOptional()
  @IsEnum(ImpactLevel)
  confidentialityImpact?: ImpactLevel;

  @IsOptional()
  @IsEnum(ImpactLevel)
  integrityImpact?: ImpactLevel;

  @IsOptional()
  @IsEnum(ImpactLevel)
  availabilityImpact?: ImpactLevel;

  @IsOptional()
  @IsEnum(ImpactLevel)
  overallCategorization?: ImpactLevel;

  @IsOptional()
  @IsEnum(MissionCriticality)
  missionCriticality?: MissionCriticality;

  @IsOptional()
  @IsEnum(DataClassification)
  dataClassification?: DataClassification;

  @IsOptional()
  @IsEnum(SecurityControlBaseline)
  securityControlBaseline?: SecurityControlBaseline;

  @IsOptional()
  @IsString()
  controlSelectionRationale?: string;

  @IsOptional()
  @IsString()
  tailoringDecisions?: string;

  @IsOptional()
  @IsEnum(AuthorizationStatus)
  authorizationStatus?: AuthorizationStatus;

  @IsOptional()
  @IsString()
  authorizationDate?: string;

  @IsOptional()
  @IsString()
  authorizationExpiry?: string;

  @IsOptional()
  @IsString()
  riskAssessmentDate?: string;

  @IsOptional()
  @IsEnum(ResidualRiskLevel)
  residualRiskLevel?: ResidualRiskLevel;

  @IsOptional()
  @IsEnum(PoamStatus)
  poamStatus?: PoamStatus;

  @IsOptional()
  @IsEnum(ContinuousMonitoringStatus)
  continuousMonitoringStatus?: ContinuousMonitoringStatus;

  @IsOptional()
  @IsString()
  lastAssessmentDate?: string;

  @IsOptional()
  @IsString()
  nextAssessmentDate?: string;

  @IsOptional()
  @IsString()
  businessOwner?: string;

  @IsOptional()
  @IsString()
  businessPurpose?: string;

  @IsOptional()
  @IsString()
  organizationalUnit?: string;

  @IsOptional()
  @IsString()
  physicalLocation?: string;

  @IsOptional()
  @IsBoolean()
  onboardingComplete?: boolean;

  @IsOptional()
  @IsString()
  onboardingCompletedBy?: string;
}
