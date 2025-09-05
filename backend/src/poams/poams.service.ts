import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreatePoamDto,
  UpdatePoamDto,
  CreatePoamMilestoneDto,
  UpdatePoamMilestoneDto,
  CreatePoamCommentDto,
} from './dto';

@Injectable()
export class PoamsService {
  constructor(private prisma: PrismaService) {}

  async findAll(packageId?: number, groupId?: number) {
    const where: Prisma.PoamWhereInput = {};

    if (packageId) {
      where.packageId = packageId;
    }
    if (groupId) {
      where.groupId = groupId;
    }

    return this.prisma.poam.findMany({
      where,
      include: {
        package: true,
        group: true,
        assignedTeam: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        milestones: {
          include: {
            assignedUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        comments: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.poam.findUnique({
      where: { id },
      include: {
        package: true,
        group: true,
        assignedTeam: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        milestones: {
          include: {
            assignedUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        comments: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        stps: {
          include: {
            stp: true,
          },
        },
      },
    });
  }

  async create(createPoamDto: CreatePoamDto) {
    const data: Prisma.PoamCreateInput = {
      poamNumber: createPoamDto.poamNumber,
      title: createPoamDto.title,
      weaknessDescription: createPoamDto.weaknessDescription,
      nistControlId: createPoamDto.nistControlId,
      severity: createPoamDto.severity || 'Medium',
      status: createPoamDto.status || 'Draft',
      priority: createPoamDto.priority || 'Medium',
      residualRiskLevel: createPoamDto.residualRiskLevel,
      targetCompletionDate: createPoamDto.targetCompletionDate,
      actualCompletionDate: createPoamDto.actualCompletionDate,
      estimatedCost: createPoamDto.estimatedCost,
      actualCost: createPoamDto.actualCost,
      pocName: createPoamDto.pocName,
      pocEmail: createPoamDto.pocEmail,
      pocPhone: createPoamDto.pocPhone,
      package: {
        connect: { id: createPoamDto.packageId },
      },
      creator: {
        connect: { id: createPoamDto.createdBy },
      },
      ...(createPoamDto.groupId && {
        group: {
          connect: { id: createPoamDto.groupId },
        },
      }),
      ...(createPoamDto.assignedTeamId && {
        assignedTeam: {
          connect: { id: createPoamDto.assignedTeamId },
        },
      }),
    };

    return this.prisma.poam.create({
      data,
      include: {
        package: true,
        group: true,
        assignedTeam: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: number, updatePoamDto: UpdatePoamDto) {
    const data: Prisma.PoamUpdateInput = {
      ...(updatePoamDto.title && { title: updatePoamDto.title }),
      ...(updatePoamDto.weaknessDescription !== undefined && {
        weaknessDescription: updatePoamDto.weaknessDescription,
      }),
      ...(updatePoamDto.nistControlId !== undefined && {
        nistControlId: updatePoamDto.nistControlId,
      }),
      ...(updatePoamDto.severity && { severity: updatePoamDto.severity }),
      ...(updatePoamDto.status && { status: updatePoamDto.status }),
      ...(updatePoamDto.priority && { priority: updatePoamDto.priority }),
      ...(updatePoamDto.residualRiskLevel !== undefined && {
        residualRiskLevel: updatePoamDto.residualRiskLevel,
      }),
      ...(updatePoamDto.targetCompletionDate !== undefined && {
        targetCompletionDate: updatePoamDto.targetCompletionDate,
      }),
      ...(updatePoamDto.actualCompletionDate !== undefined && {
        actualCompletionDate: updatePoamDto.actualCompletionDate,
      }),
      ...(updatePoamDto.estimatedCost !== undefined && {
        estimatedCost: updatePoamDto.estimatedCost,
      }),
      ...(updatePoamDto.actualCost !== undefined && {
        actualCost: updatePoamDto.actualCost,
      }),
      ...(updatePoamDto.pocName !== undefined && {
        pocName: updatePoamDto.pocName,
      }),
      ...(updatePoamDto.pocEmail !== undefined && {
        pocEmail: updatePoamDto.pocEmail,
      }),
      ...(updatePoamDto.pocPhone !== undefined && {
        pocPhone: updatePoamDto.pocPhone,
      }),
      ...(updatePoamDto.groupId !== undefined && {
        group: updatePoamDto.groupId
          ? { connect: { id: updatePoamDto.groupId } }
          : { disconnect: true },
      }),
      ...(updatePoamDto.assignedTeamId !== undefined && {
        assignedTeam: updatePoamDto.assignedTeamId
          ? { connect: { id: updatePoamDto.assignedTeamId } }
          : { disconnect: true },
      }),
    };

    return this.prisma.poam.update({
      where: { id },
      data,
      include: {
        package: true,
        group: true,
        assignedTeam: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    return this.prisma.poam.delete({
      where: { id },
    });
  }

  // Milestones
  async findMilestones(poamId: number) {
    return this.prisma.poamMilestone.findMany({
      where: { poamId },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createMilestone(
    poamId: number,
    createMilestoneDto: CreatePoamMilestoneDto,
  ) {
    const data: Prisma.PoamMilestoneCreateInput = {
      title: createMilestoneDto.title,
      description: createMilestoneDto.description,
      targetDate: createMilestoneDto.targetDate,
      actualDate: createMilestoneDto.actualDate,
      status: createMilestoneDto.status || 'Pending',
      milestoneType: createMilestoneDto.milestoneType || 'Implementation',
      deliverables: createMilestoneDto.deliverables,
      successCriteria: createMilestoneDto.successCriteria,
      completionPercentage: createMilestoneDto.completionPercentage || 0,
      poam: {
        connect: { id: poamId },
      },
      ...(createMilestoneDto.assignedUserId && {
        assignedUser: {
          connect: { id: createMilestoneDto.assignedUserId },
        },
      }),
    };

    return this.prisma.poamMilestone.create({
      data,
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateMilestone(
    id: number,
    updateMilestoneDto: UpdatePoamMilestoneDto,
  ) {
    const data: Prisma.PoamMilestoneUpdateInput = {
      ...(updateMilestoneDto.title && { title: updateMilestoneDto.title }),
      ...(updateMilestoneDto.description !== undefined && {
        description: updateMilestoneDto.description,
      }),
      ...(updateMilestoneDto.targetDate !== undefined && {
        targetDate: updateMilestoneDto.targetDate,
      }),
      ...(updateMilestoneDto.actualDate !== undefined && {
        actualDate: updateMilestoneDto.actualDate,
      }),
      ...(updateMilestoneDto.status && { status: updateMilestoneDto.status }),
      ...(updateMilestoneDto.milestoneType !== undefined && {
        milestoneType: updateMilestoneDto.milestoneType,
      }),
      ...(updateMilestoneDto.deliverables !== undefined && {
        deliverables: updateMilestoneDto.deliverables,
      }),
      ...(updateMilestoneDto.successCriteria !== undefined && {
        successCriteria: updateMilestoneDto.successCriteria,
      }),
      ...(updateMilestoneDto.completionPercentage !== undefined && {
        completionPercentage: updateMilestoneDto.completionPercentage,
      }),
      ...(updateMilestoneDto.assignedUserId !== undefined && {
        assignedUser: updateMilestoneDto.assignedUserId
          ? { connect: { id: updateMilestoneDto.assignedUserId } }
          : { disconnect: true },
      }),
    };

    return this.prisma.poamMilestone.update({
      where: { id },
      data,
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteMilestone(id: number) {
    return this.prisma.poamMilestone.delete({
      where: { id },
    });
  }

  // Comments
  async findComments(poamId: number) {
    return this.prisma.poamComment.findMany({
      where: { poamId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createComment(poamId: number, createCommentDto: CreatePoamCommentDto) {
    const data: Prisma.PoamCommentCreateInput = {
      comment: createCommentDto.comment,
      commentType: createCommentDto.commentType || 'General',
      poam: {
        connect: { id: poamId },
      },
      creator: {
        connect: { id: createCommentDto.createdBy },
      },
      ...(createCommentDto.milestoneId && {
        milestoneId: createCommentDto.milestoneId,
      }),
    };

    return this.prisma.poamComment.create({
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
