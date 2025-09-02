import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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

  async create(data: any) {
    const createData: Prisma.StpCreateInput = {
      title: data.title,
      description: data.description || '',
      status: data.status || 'Draft',
      priority: data.priority || 'Medium',
      dueDate: data.due_date,
      system: {
        connect: { id: data.system_id }
      },
      package: {
        connect: { id: data.package_id }
      },
      creator: {
        connect: { id: data.created_by }
      },
      ...(data.assigned_team_id && {
        assignedTeam: {
          connect: { id: data.assigned_team_id }
        }
      })
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

  async update(id: number, data: Prisma.StpUpdateInput) {
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

  async createTestCase(stpId: number, data: Omit<Prisma.StpTestCaseCreateInput, 'stp'>) {
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
    uploadedBy: number
  ) {
    const evidence = await this.prisma.stpEvidence.create({
      data: {
        testCaseId,
        filename,
        originalFilename,
        fileSize,
        mimeType,
        description,
        uploadedBy,
        stp: {
          connect: {
            id: (await this.prisma.stpTestCase.findUnique({
              where: { id: testCaseId },
              select: { stpId: true }
            }))?.stpId
          }
        }
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

  async addTestCaseComment(testCaseId: number, content: string, createdBy: number) {
    // For now, return a mock comment
    // This can be implemented when the comments schema is added
    const mockComment = {
      id: Date.now(),
      content,
      createdAt: new Date().toISOString(),
      createdBy: {
        id: createdBy,
        name: 'Current User',
        email: 'user@example.com'
      }
    };

    return { item: mockComment };
  }
}
