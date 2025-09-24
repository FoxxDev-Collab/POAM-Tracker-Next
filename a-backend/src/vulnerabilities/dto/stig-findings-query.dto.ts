import { IsOptional, IsString } from 'class-validator';

export class StigFindingsQueryDto {
  @IsOptional()
  @IsString()
  package_id?: string;

  @IsOptional()
  @IsString()
  system_id?: string;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  group_id?: string;

  @IsOptional()
  @IsString()
  rule_id?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  offset?: string;
}
