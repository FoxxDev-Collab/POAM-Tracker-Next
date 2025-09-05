import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { PoamCommentType } from '@prisma/client';

export class CreatePoamCommentDto {
  @IsOptional()
  @IsInt()
  milestoneId?: number;

  @IsString()
  comment: string;

  @IsOptional()
  @IsEnum(PoamCommentType)
  commentType?: PoamCommentType;

  @IsInt()
  createdBy: number;
}
