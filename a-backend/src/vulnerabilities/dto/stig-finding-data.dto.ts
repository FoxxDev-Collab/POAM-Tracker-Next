import { IsString, IsOptional } from 'class-validator';

export class StigFindingDataDto {
  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  group_id?: string;

  @IsOptional()
  @IsString()
  ruleId?: string;

  @IsOptional()
  @IsString()
  rule_id?: string;

  @IsOptional()
  @IsString()
  ruleVersion?: string;

  @IsOptional()
  @IsString()
  rule_version?: string;

  @IsOptional()
  @IsString()
  ruleTitle?: string;

  @IsOptional()
  @IsString()
  rule_title?: string;

  @IsString()
  severity: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  findingDetails?: string;

  @IsOptional()
  @IsString()
  finding_details?: string;

  @IsOptional()
  @IsString()
  checkContent?: string;

  @IsOptional()
  @IsString()
  check_content?: string;

  @IsOptional()
  @IsString()
  fixText?: string;

  @IsOptional()
  @IsString()
  fix_text?: string;

  @IsOptional()
  @IsString()
  cci?: string;
}
