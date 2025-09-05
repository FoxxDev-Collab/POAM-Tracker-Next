import { IsInt, IsOptional, IsEnum } from 'class-validator';
import { TeamMembershipRole } from '@prisma/client';

export class AddTeamMemberDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsEnum(TeamMembershipRole)
  role?: TeamMembershipRole;
}
