import { IsOptional, IsString } from 'class-validator';

export class NessusVulnerabilitiesQueryDto {
  @IsOptional()
  @IsString()
  report_id?: string;

  @IsOptional()
  @IsString()
  host_id?: string;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsString()
  plugin_family?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  offset?: string;

  @IsOptional()
  @IsString()
  system_id?: string;
}
