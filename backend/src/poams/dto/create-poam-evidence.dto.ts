import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { EvidenceType } from '@prisma/client';

export class CreatePoamEvidenceDto {
  @IsString()
  fileName: string;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsOptional()
  @IsInt()
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsEnum(EvidenceType)
  evidenceType?: EvidenceType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  milestoneId?: number;

  @IsInt()
  uploadedBy: number;
}