import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreatePoamReviewDto {
  @IsString()
  reviewType: string;

  @IsDateString()
  reviewDate: string;

  @IsInt()
  reviewedBy: number;

  @IsOptional()
  @IsString()
  findings?: string;

  @IsOptional()
  @IsString()
  recommendations?: string;

  @IsOptional()
  @IsDateString()
  nextReviewDate?: string;
}