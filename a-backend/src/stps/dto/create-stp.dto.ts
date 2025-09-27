import { IsString, IsOptional, IsInt, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { StpStatus, StpPriority } from '@prisma/client';
import { Type } from 'class-transformer';

class VulnerabilityDto {
  @IsInt()
  systemId: number;

  @IsString()
  vulnId: string;

  @IsString()
  ruleId: string;
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VulnerabilityDto)
  vulnerabilities?: VulnerabilityDto[];
}
