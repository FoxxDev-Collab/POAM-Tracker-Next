import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTeamDto, UpdateTeamDto } from './dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.team.findMany({
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        packages: true,
        stpsAssigned: true,
        poamsAssigned: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.team.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        packages: true,
        stpsAssigned: true,
        poamsAssigned: true,
      },
    });
  }

  async create(createTeamDto: CreateTeamDto) {
    const data: Prisma.TeamCreateInput = {
      name: createTeamDto.name,
      description: createTeamDto.description,
      active: createTeamDto.active ?? true,
      lead: {
        connect: { id: createTeamDto.leadUserId },
      },
    };

    return this.prisma.team.create({
      data,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    const data: Prisma.TeamUpdateInput = {
      ...(updateTeamDto.name && { name: updateTeamDto.name }),
      ...(updateTeamDto.description !== undefined && { description: updateTeamDto.description }),
      ...(updateTeamDto.active !== undefined && { active: updateTeamDto.active }),
      ...(updateTeamDto.leadUserId && {
        lead: {
          connect: { id: updateTeamDto.leadUserId },
        },
      }),
    };

    return this.prisma.team.update({
      where: { id },
      data,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: number) {
    return this.prisma.team.delete({
      where: { id },
    });
  }

  // Team Members
  async findMembers(teamId: number) {
    return this.prisma.teamMembership.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async addMember(
    teamId: number,
    userId: number,
    role: 'Lead' | 'Member' = 'Member',
  ) {
    return this.prisma.teamMembership.create({
      data: {
        teamId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async updateMember(teamId: number, userId: number, role: 'Lead' | 'Member') {
    return this.prisma.teamMembership.update({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async removeMember(teamId: number, userId: number) {
    return this.prisma.teamMembership.delete({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });
  }
}
