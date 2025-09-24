import { IsOptional, IsString } from 'class-validator';

export class NessusReportsQueryDto {
  @IsOptional()
  @IsString()
  package_id?: string;

  @IsOptional()
  @IsString()
  system_id?: string;
}
