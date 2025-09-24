import { IsString, IsOptional, IsInt } from 'class-validator';

export class NessusHostDto {
  @IsString()
  hostname: string;

  @IsString()
  ip_address: string;

  @IsOptional()
  @IsString()
  mac_address?: string;

  @IsOptional()
  @IsString()
  os_info?: string;

  @IsInt()
  total_vulnerabilities: number;

  @IsInt()
  critical_count: number;

  @IsInt()
  high_count: number;

  @IsInt()
  medium_count: number;

  @IsInt()
  low_count: number;

  @IsInt()
  info_count: number;
}
