import { IsEnum } from 'class-validator';
import { TeamMembershipRole } from '@prisma/client';

export class UpdateTeamMemberDto {
  @IsEnum(TeamMembershipRole)
  role: TeamMembershipRole;
}
