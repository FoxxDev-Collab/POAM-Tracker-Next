import {
  IsObject,
  IsArray,
  IsOptional,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NessusReportDto } from './nessus-report.dto';
import { NessusHostDto } from './nessus-host.dto';
import { NessusVulnerabilityDto } from './nessus-vulnerability.dto';

export class NessusImportRequestDto {
  @IsObject()
  @ValidateNested()
  @Type(() => NessusReportDto)
  report: NessusReportDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NessusHostDto)
  hosts: NessusHostDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NessusVulnerabilityDto)
  vulnerabilities: NessusVulnerabilityDto[];

  @IsOptional()
  @IsInt()
  package_id?: number;

  @IsOptional()
  @IsInt()
  system_id?: number;
}
