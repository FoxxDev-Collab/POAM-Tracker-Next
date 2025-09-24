import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { StpTestCaseStatus } from '@prisma/client';

export class UpdateTestCaseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  testProcedure?: string;

  @IsOptional()
  @IsString()
  expectedResult?: string;

  @IsOptional()
  @IsString()
  actualResult?: string;

  @IsOptional()
  @IsEnum(StpTestCaseStatus)
  status?: StpTestCaseStatus;

  @IsOptional()
  @IsInt()
  assignedUserId?: number;
}
