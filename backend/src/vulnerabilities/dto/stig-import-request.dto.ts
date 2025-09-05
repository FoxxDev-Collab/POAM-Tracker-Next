import { IsArray, IsOptional, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StigFindingDataDto } from './stig-finding-data.dto';

export class StigImportRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StigFindingDataDto)
  findings: StigFindingDataDto[];

  @IsOptional()
  @IsInt()
  package_id?: number;

  @IsOptional()
  @IsInt()
  system_id?: number;
}
