import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateStpDto,
  UpdateStpDto,
} from './dto';

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
        vulnerabilities: {
          include: {
            finding: {
              select: {
                vulnId: true,
                ruleId: true,
                ruleTitle: true,
                severity: true,
                status: true,
                controlId: true,
              },
            },
          },
        },
      },
    });

    // Get unique control IDs from vulnerabilities
    if (stp && stp.vulnerabilities) {
      const controlIds = [...new Set(
        stp.vulnerabilities
          .filter(v => v.finding?.controlId)
          .map(v => v.finding!.controlId)
      )];

      // For now, return empty controls array since ControlImplementation model doesn't exist yet
      // This will be implemented when the control tracking is fully integrated
      const controls = [];

      return {
        item: {
          ...stp,
          relatedControls: controls,
        }
      };
    }

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

    // Create vulnerability associations if provided
    if (createStpDto.vulnerabilities && createStpDto.vulnerabilities.length > 0) {
      await this.prisma.stpVulnerability.createMany({
        data: createStpDto.vulnerabilities.map(vuln => ({
          stpId: stp.id,
          systemId: vuln.systemId,
          vulnId: vuln.vulnId,
          ruleId: vuln.ruleId,
        })),
      });
    }

    return { item: stp };
  }

  async update(id: number, updateStpDto: UpdateStpDto) {
    const data: Prisma.StpUpdateInput = {
      ...(updateStpDto.title && { title: updateStpDto.title }),
      ...(updateStpDto.description !== undefined && {
        description: updateStpDto.description,
      }),
      ...(updateStpDto.status && { status: updateStpDto.status }),
      ...(updateStpDto.priority && { priority: updateStpDto.priority }),
      ...(updateStpDto.dueDate !== undefined && {
        dueDate: updateStpDto.dueDate,
      }),
      ...(updateStpDto.assignedTeamId !== undefined && {
        assignedTeam: updateStpDto.assignedTeamId
          ? { connect: { id: updateStpDto.assignedTeamId } }
          : { disconnect: true },
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
  async getTestCaseComments(_testCaseId: number) {
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

  async markTestCaseAsNotAFinding(
    testCaseId: number,
    justification: string,
    userId: number,
  ) {
    // First, get the test case to find associated vulnerabilities
    const testCase = await this.prisma.stpTestCase.findUnique({
      where: { id: testCaseId },
      include: {
        stp: {
          include: {
            vulnerabilities: true,
          },
        },
      },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    // Update the test case status to Passed with Not A Finding result
    const updatedTestCase = await this.prisma.stpTestCase.update({
      where: { id: testCaseId },
      data: {
        status: 'Passed',
        actualResult: `Not A Finding: ${justification}`,
      },
    });

    // Update associated STIG findings to mark them as Not A Finding
    if (testCase.stp.vulnerabilities.length > 0) {
      const vulnIds = testCase.stp.vulnerabilities.map(v => v.vulnId);

      await this.prisma.stigFinding.updateMany({
        where: {
          vulnId: { in: vulnIds },
          systemId: testCase.stp.systemId,
        },
        data: {
          status: 'Not_A_Finding',
          justification: justification,
          reviewedAt: new Date(),
          reviewedBy: userId,
        },
      });
    }

    return { item: updatedTestCase };
  }

  async updateVulnerabilityStatus(
    testCaseId: number,
    status: string,
    justification: string,
    userId: number,
  ) {
    // First, get the test case to find associated vulnerabilities
    const testCase = await this.prisma.stpTestCase.findUnique({
      where: { id: testCaseId },
      include: {
        stp: {
          include: {
            vulnerabilities: true,
          },
        },
      },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    // Validate status is allowed
    const allowedStatuses = ['Not_A_Finding', 'Not_Applicable', 'Not_Reviewed', 'Open'];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${allowedStatuses.join(', ')}`);
    }

    // Update the test case status to Passed with the new vulnerability status
    const updatedTestCase = await this.prisma.stpTestCase.update({
      where: { id: testCaseId },
      data: {
        status: 'Passed',
        actualResult: `STIG Finding updated to ${status}: ${justification}`,
      },
    });

    // Update associated STIG findings
    if (testCase.stp.vulnerabilities.length > 0) {
      const vulnIds = testCase.stp.vulnerabilities.map(v => v.vulnId);

      await this.prisma.stigFinding.updateMany({
        where: {
          vulnId: { in: vulnIds },
          systemId: testCase.stp.systemId,
        },
        data: {
          status: status,
          justification: justification,
          reviewedAt: new Date(),
          reviewedBy: userId,
        },
      });
    }

    return {
      item: updatedTestCase,
      message: `Vulnerability status updated to ${status}`,
      updatedVulnerabilities: testCase.stp.vulnerabilities.map(v => v.vulnId)
    };
  }
}
