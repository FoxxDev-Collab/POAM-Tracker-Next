import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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

  async create(data: Prisma.PoamCreateInput) {
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

  async update(id: number, data: Prisma.PoamUpdateInput) {
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
    data: Omit<Prisma.PoamMilestoneCreateInput, 'poam'>,
  ) {
    return this.prisma.poamMilestone.create({
      data: {
        ...data,
        poam: {
          connect: { id: poamId },
        },
      },
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

  async updateMilestone(id: number, data: Prisma.PoamMilestoneUpdateInput) {
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

  async createComment(
    poamId: number,
    data: Omit<Prisma.PoamCommentCreateInput, 'poam'>,
  ) {
    return this.prisma.poamComment.create({
      data: {
        ...data,
        poam: {
          connect: { id: poamId },
        },
      },
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
