import { IsString, IsOptional, IsInt } from 'class-validator';

export class UploadTestCaseEvidenceDto {
  @IsString()
  filename: string;

  @IsString()
  originalFilename: string;

  @IsInt()
  fileSize: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  uploadedBy: number;
}
