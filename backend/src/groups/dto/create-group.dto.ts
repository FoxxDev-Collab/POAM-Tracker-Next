import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateGroupDto {
  @IsInt()
  packageId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
