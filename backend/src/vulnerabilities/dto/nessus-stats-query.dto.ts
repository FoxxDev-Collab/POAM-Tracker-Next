import { IsOptional, IsString } from 'class-validator';

export class NessusStatsQueryDto {
  @IsOptional()
  @IsString()
  package_id?: string;

  @IsOptional()
  @IsString()
  system_id?: string;

  @IsOptional()
  @IsString()
  report_id?: string;
}
