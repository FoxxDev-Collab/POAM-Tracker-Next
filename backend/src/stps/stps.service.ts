import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateStpDto, UpdateStpDto, CreateTestCaseDto, UpdateTestCaseDto } from './dto';

@Injectable()
export class StpsService {
  constructor(private prisma: PrismaService) {}

  async findAll(packageId?: number, systemId?: number) {
    const where: Prisma.StpWhereInput = {};

    if (packageId) {
      where.packageId = packageId;
    }
    if (systemId) {
      where.systemId = systemId;
    }

    const stps = await this.prisma.stp.findMany({
      where,
      include: {
        system: true,
        package: true,
        assignedTeam: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        testCases: {
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { items: stps };
  }

  async findOne(id: number) {
    const stp = await this.prisma.stp.findUnique({
      where: { id },
      include: {
        system: true,
        package: true,
        assignedTeam: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        testCases: {
          include: {
            assignedUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            evidence: true,
          },
        },
        evidence: {
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return stp ? { item: stp } : null;
  }

  async create(createStpDto: CreateStpDto) {
    const createData: Prisma.StpCreateInput = {
      title: createStpDto.title,
      description: createStpDto.description || '',
      status: createStpDto.status || 'Draft',
      priority: createStpDto.priority || 'Medium',
      dueDate: createStpDto.dueDate,
      system: {
        connect: { id: createStpDto.systemId },
      },
      package: {
        connect: { id: createStpDto.packageId },
      },
      creator: {
        connect: { id: createStpDto.createdBy },
      },
      ...(createStpDto.assignedTeamId && {
        assignedTeam: {
          connect: { id: createStpDto.assignedTeamId },
        },
      }),
    };

    const stp = await this.prisma.stp.create({
      data: createData,
      include: {
        system: true,
        package: true,
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

    return { item: stp };
  }

  async update(id: number, updateStpDto: UpdateStpDto) {
    const data: Prisma.StpUpdateInput = {
      ...(updateStpDto.title && { title: updateStpDto.title }),
      ...(updateStpDto.description !== undefined && { description: updateStpDto.description }),
      ...(updateStpDto.status && { status: updateStpDto.status }),
      ...(updateStpDto.priority && { priority: updateStpDto.priority }),
      ...(updateStpDto.dueDate !== undefined && { dueDate: updateStpDto.dueDate }),
      ...(updateStpDto.assignedTeamId !== undefined && {
        assignedTeam: updateStpDto.assignedTeamId 
          ? { connect: { id: updateStpDto.assignedTeamId } }
          : { disconnect: true }
      }),
    };

    const stp = await this.prisma.stp.update({
      where: { id },
      data,
      include: {
        system: true,
        package: true,
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

    return { item: stp };
  }

  async remove(id: number) {
    return this.prisma.stp.delete({
      where: { id },
    });
  }

  // Test Cases
  async findTestCases(stpId: number) {
    const testCases = await this.prisma.stpTestCase.findMany({
      where: { stpId },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        evidence: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return { items: testCases };
  }

  async createTestCase(
    stpId: number,
    data: Omit<Prisma.StpTestCaseCreateInput, 'stp'>,
  ) {
    const testCase = await this.prisma.stpTestCase.create({
      data: {
        ...data,
        stp: {
          connect: { id: stpId },
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

    return { item: testCase };
  }

  async updateTestCase(id: number, data: Prisma.StpTestCaseUpdateInput) {
    const testCase = await this.prisma.stpTestCase.update({
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

    return { item: testCase };
  }

  async deleteTestCase(id: number) {
    return this.prisma.stpTestCase.delete({
      where: { id },
    });
  }

  // Evidence management
  async getTestCaseEvidence(testCaseId: number) {
    const evidence = await this.prisma.stpEvidence.findMany({
      where: { testCaseId },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return { items: evidence };
  }

  async uploadTestCaseEvidence(
    testCaseId: number,
    filename: string,
    originalFilename: string,
    fileSize: number,
    mimeType: string,
    description: string,
    uploadedBy: number,
  ) {
    const testCase = await this.prisma.stpTestCase.findUnique({
      where: { id: testCaseId },
      select: { stpId: true },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    const evidence = await this.prisma.stpEvidence.create({
      data: {
        stpId: testCase.stpId,
        testCaseId,
        filename,
        originalFilename,
        fileSize,
        mimeType,
        description,
        uploadedBy,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return { item: evidence };
  }

  // Comments management (using existing schema if available)
  async getTestCaseComments(testCaseId: number) {
    // For now, return empty array since we might not have a comments table
    // This can be implemented when the comments schema is added
    return { items: [] };
  }

  async addTestCaseComment(
    testCaseId: number,
    content: string,
    createdBy: number,
  ) {
    // For now, return a mock comment
    // This can be implemented when the comments schema is added
    const mockComment = {
      id: Date.now(),
      content,
      createdAt: new Date().toISOString(),
      createdBy: {
        id: createdBy,
        name: 'Current User',
        email: 'user@example.com',
      },
    };

    return { item: mockComment };
  }
}
