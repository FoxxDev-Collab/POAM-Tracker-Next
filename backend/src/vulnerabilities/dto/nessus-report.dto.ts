import { IsString, IsInt, IsOptional } from 'class-validator';

export class NessusReportDto {
  @IsString()
  filename: string;

  @IsString()
  scan_name: string;

  @IsString()
  scan_date: string;

  @IsInt()
  total_hosts: number;

  @IsInt()
  total_vulnerabilities: number;

  @IsOptional()
  @IsString()
  scan_metadata?: string;
}
