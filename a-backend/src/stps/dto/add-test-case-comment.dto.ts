import { IsString } from 'class-validator';

export class AddTestCaseCommentDto {
  @IsString()
  content: string;
}
