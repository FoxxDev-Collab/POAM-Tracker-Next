import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreatePoamDto,
  UpdatePoamDto,
  CreatePoamMilestoneDto,
  UpdatePoamMilestoneDto,
  CreatePoamCommentDto,
  CreatePoamEvidenceDto,
  CreatePoamReviewDto,
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
        riskAcceptor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
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
        evidences: {
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
        reviews: {
          include: {
            reviewer: {
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
        riskAcceptor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
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
            evidences: true,
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
        evidences: {
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            milestone: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
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
    // Calculate risk score if likelihood and impact are provided
    let inherentRiskScore = createPoamDto.inherentRiskScore;
    if (!inherentRiskScore && createPoamDto.likelihood && createPoamDto.impact) {
      inherentRiskScore = this.calculateRiskScore(
        createPoamDto.likelihood,
        createPoamDto.impact,
      );
    }

    const data: Prisma.PoamCreateInput = {
      poamNumber: createPoamDto.poamNumber,
      title: createPoamDto.title,
      weaknessDescription: createPoamDto.weaknessDescription,
      nistControlId: createPoamDto.nistControlId,
      severity: createPoamDto.severity || 'Medium',
      status: createPoamDto.status || 'Draft',
      priority: createPoamDto.priority || 'Medium',

      // Risk Management
      inherentRiskScore,
      residualRiskScore: createPoamDto.residualRiskScore,
      residualRiskLevel: createPoamDto.residualRiskLevel,
      threatLevel: createPoamDto.threatLevel,
      likelihood: createPoamDto.likelihood,
      impact: createPoamDto.impact,
      riskStatement: createPoamDto.riskStatement,
      mitigationStrategy: createPoamDto.mitigationStrategy,
      riskAcceptance: createPoamDto.riskAcceptance || false,
      riskAcceptanceRationale: createPoamDto.riskAcceptanceRationale,

      // Dates
      targetCompletionDate: createPoamDto.targetCompletionDate
        ? new Date(createPoamDto.targetCompletionDate)
        : undefined,
      actualCompletionDate: createPoamDto.actualCompletionDate
        ? new Date(createPoamDto.actualCompletionDate)
        : undefined,
      scheduledReviewDate: createPoamDto.scheduledReviewDate
        ? new Date(createPoamDto.scheduledReviewDate)
        : undefined,

      // Points of Contact
      pocName: createPoamDto.pocName,
      pocEmail: createPoamDto.pocEmail,
      pocPhone: createPoamDto.pocPhone,
      altPocName: createPoamDto.altPocName,
      altPocEmail: createPoamDto.altPocEmail,
      altPocPhone: createPoamDto.altPocPhone,

      // Relationships
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
    // Calculate risk score if likelihood and impact are updated
    let inherentRiskScore = updatePoamDto.inherentRiskScore;
    if (!inherentRiskScore && updatePoamDto.likelihood && updatePoamDto.impact) {
      inherentRiskScore = this.calculateRiskScore(
        updatePoamDto.likelihood,
        updatePoamDto.impact,
      );
    }

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

      // Risk Management
      ...(inherentRiskScore !== undefined && { inherentRiskScore }),
      ...(updatePoamDto.residualRiskScore !== undefined && {
        residualRiskScore: updatePoamDto.residualRiskScore,
      }),
      ...(updatePoamDto.residualRiskLevel !== undefined && {
        residualRiskLevel: updatePoamDto.residualRiskLevel,
      }),
      ...(updatePoamDto.threatLevel && { threatLevel: updatePoamDto.threatLevel }),
      ...(updatePoamDto.likelihood && { likelihood: updatePoamDto.likelihood }),
      ...(updatePoamDto.impact && { impact: updatePoamDto.impact }),
      ...(updatePoamDto.riskStatement !== undefined && {
        riskStatement: updatePoamDto.riskStatement,
      }),
      ...(updatePoamDto.mitigationStrategy !== undefined && {
        mitigationStrategy: updatePoamDto.mitigationStrategy,
      }),
      ...(updatePoamDto.riskAcceptance !== undefined && {
        riskAcceptance: updatePoamDto.riskAcceptance,
      }),
      ...(updatePoamDto.riskAcceptanceRationale !== undefined && {
        riskAcceptanceRationale: updatePoamDto.riskAcceptanceRationale,
      }),
      ...(updatePoamDto.riskAcceptedBy !== undefined && {
        riskAcceptor: updatePoamDto.riskAcceptedBy
          ? { connect: { id: updatePoamDto.riskAcceptedBy } }
          : { disconnect: true },
      }),
      ...(updatePoamDto.riskAcceptedDate !== undefined && {
        riskAcceptedDate: updatePoamDto.riskAcceptedDate
          ? new Date(updatePoamDto.riskAcceptedDate)
          : null,
      }),

      // Dates
      ...(updatePoamDto.targetCompletionDate !== undefined && {
        targetCompletionDate: updatePoamDto.targetCompletionDate
          ? new Date(updatePoamDto.targetCompletionDate)
          : null,
      }),
      ...(updatePoamDto.actualCompletionDate !== undefined && {
        actualCompletionDate: updatePoamDto.actualCompletionDate
          ? new Date(updatePoamDto.actualCompletionDate)
          : null,
      }),
      ...(updatePoamDto.scheduledReviewDate !== undefined && {
        scheduledReviewDate: updatePoamDto.scheduledReviewDate
          ? new Date(updatePoamDto.scheduledReviewDate)
          : null,
      }),
      ...(updatePoamDto.lastReviewedDate !== undefined && {
        lastReviewedDate: updatePoamDto.lastReviewedDate
          ? new Date(updatePoamDto.lastReviewedDate)
          : null,
      }),

      // Points of Contact
      ...(updatePoamDto.pocName !== undefined && {
        pocName: updatePoamDto.pocName,
      }),
      ...(updatePoamDto.pocEmail !== undefined && {
        pocEmail: updatePoamDto.pocEmail,
      }),
      ...(updatePoamDto.pocPhone !== undefined && {
        pocPhone: updatePoamDto.pocPhone,
      }),
      ...(updatePoamDto.altPocName !== undefined && {
        altPocName: updatePoamDto.altPocName,
      }),
      ...(updatePoamDto.altPocEmail !== undefined && {
        altPocEmail: updatePoamDto.altPocEmail,
      }),
      ...(updatePoamDto.altPocPhone !== undefined && {
        altPocPhone: updatePoamDto.altPocPhone,
      }),

      // Approval Workflow
      ...(updatePoamDto.approvalStatus !== undefined && {
        approvalStatus: updatePoamDto.approvalStatus,
      }),
      ...(updatePoamDto.submittedForApprovalAt !== undefined && {
        submittedForApprovalAt: updatePoamDto.submittedForApprovalAt
          ? new Date(updatePoamDto.submittedForApprovalAt)
          : null,
      }),
      ...(updatePoamDto.approvedBy !== undefined && {
        approver: updatePoamDto.approvedBy
          ? { connect: { id: updatePoamDto.approvedBy } }
          : { disconnect: true },
      }),
      ...(updatePoamDto.approvedAt !== undefined && {
        approvedAt: updatePoamDto.approvedAt
          ? new Date(updatePoamDto.approvedAt)
          : null,
      }),
      ...(updatePoamDto.approvalComments !== undefined && {
        approvalComments: updatePoamDto.approvalComments,
      }),

      // Relationships
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
        riskAcceptor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
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
        evidences: true,
      },
      orderBy: {
        targetDate: 'asc',
      },
    });
  }

  async createMilestone(
    poamId: number,
    createMilestoneDto: CreatePoamMilestoneDto,
  ) {
    // Validate milestone date against POAM target date
    if (createMilestoneDto.targetDate) {
      await this.validateMilestoneDate(poamId, createMilestoneDto.targetDate);
    }

    const data: Prisma.PoamMilestoneCreateInput = {
      title: createMilestoneDto.title,
      description: createMilestoneDto.description,
      targetDate: createMilestoneDto.targetDate
        ? new Date(createMilestoneDto.targetDate)
        : undefined,
      actualDate: createMilestoneDto.actualDate
        ? new Date(createMilestoneDto.actualDate)
        : undefined,
      status: createMilestoneDto.status || 'Pending',
      milestoneType: createMilestoneDto.milestoneType || 'Implementation',
      deliverables: createMilestoneDto.deliverables,
      successCriteria: createMilestoneDto.successCriteria,
      completionPercentage: createMilestoneDto.completionPercentage || 0,
      blockers: createMilestoneDto.blockers,
      dependencies: createMilestoneDto.dependencies,
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
    // Get the milestone to find the POAM ID
    const milestone = await this.prisma.poamMilestone.findUnique({
      where: { id },
    });

    if (!milestone) {
      throw new BadRequestException('Milestone not found');
    }

    // Validate milestone date against POAM target date
    if (updateMilestoneDto.targetDate) {
      await this.validateMilestoneDate(
        milestone.poamId,
        updateMilestoneDto.targetDate,
      );
    }

    const data: Prisma.PoamMilestoneUpdateInput = {
      ...(updateMilestoneDto.title && { title: updateMilestoneDto.title }),
      ...(updateMilestoneDto.description !== undefined && {
        description: updateMilestoneDto.description,
      }),
      ...(updateMilestoneDto.targetDate !== undefined && {
        targetDate: updateMilestoneDto.targetDate
          ? new Date(updateMilestoneDto.targetDate)
          : null,
      }),
      ...(updateMilestoneDto.actualDate !== undefined && {
        actualDate: updateMilestoneDto.actualDate
          ? new Date(updateMilestoneDto.actualDate)
          : null,
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
      ...(updateMilestoneDto.blockers !== undefined && {
        blockers: updateMilestoneDto.blockers,
      }),
      ...(updateMilestoneDto.dependencies !== undefined && {
        dependencies: updateMilestoneDto.dependencies,
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

  // Evidence Management
  async findEvidences(poamId: number) {
    return this.prisma.poamEvidence.findMany({
      where: { poamId },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        milestone: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });
  }

  async createEvidence(
    poamId: number,
    createEvidenceDto: CreatePoamEvidenceDto,
  ) {
    const data: Prisma.PoamEvidenceCreateInput = {
      fileName: createEvidenceDto.fileName,
      filePath: createEvidenceDto.filePath,
      fileSize: createEvidenceDto.fileSize,
      mimeType: createEvidenceDto.mimeType,
      evidenceType: createEvidenceDto.evidenceType || 'Document',
      description: createEvidenceDto.description,
      poam: {
        connect: { id: poamId },
      },
      uploader: {
        connect: { id: createEvidenceDto.uploadedBy },
      },
      ...(createEvidenceDto.milestoneId && {
        milestone: {
          connect: { id: createEvidenceDto.milestoneId },
        },
      }),
    };

    return this.prisma.poamEvidence.create({
      data,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        milestone: true,
      },
    });
  }

  async deleteEvidence(id: number) {
    return this.prisma.poamEvidence.delete({
      where: { id },
    });
  }

  // Review Management
  async findReviews(poamId: number) {
    return this.prisma.poamReview.findMany({
      where: { poamId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        reviewDate: 'desc',
      },
    });
  }

  async createReview(poamId: number, createReviewDto: CreatePoamReviewDto) {
    const data: Prisma.PoamReviewCreateInput = {
      reviewType: createReviewDto.reviewType,
      reviewDate: new Date(createReviewDto.reviewDate),
      findings: createReviewDto.findings,
      recommendations: createReviewDto.recommendations,
      nextReviewDate: createReviewDto.nextReviewDate
        ? new Date(createReviewDto.nextReviewDate)
        : undefined,
      poam: {
        connect: { id: poamId },
      },
      reviewer: {
        connect: { id: createReviewDto.reviewedBy },
      },
    };

    // Update POAM's last reviewed date
    await this.prisma.poam.update({
      where: { id: poamId },
      data: {
        lastReviewedDate: new Date(createReviewDto.reviewDate),
      },
    });

    return this.prisma.poamReview.create({
      data,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Helper Methods
  private async validateMilestoneDate(poamId: number, milestoneDate: string) {
    const poam = await this.prisma.poam.findUnique({
      where: { id: poamId },
      select: { targetCompletionDate: true },
    });

    if (poam?.targetCompletionDate) {
      const milestoneDateTime = new Date(milestoneDate);
      const poamTargetDate = new Date(poam.targetCompletionDate);

      if (milestoneDateTime > poamTargetDate) {
        throw new BadRequestException(
          `Milestone target date cannot exceed POAM target completion date (${poam.targetCompletionDate.toISOString()})`,
        );
      }
    }
  }

  private calculateRiskScore(
    likelihood: string,
    impact: string,
  ): number {
    const likelihoodScores = {
      Very_Unlikely: 1,
      Unlikely: 2,
      Possible: 3,
      Likely: 4,
      Very_Likely: 5,
    };

    const impactScores = {
      Negligible: 1,
      Minor: 2,
      Moderate: 3,
      Major: 4,
      Severe: 5,
    };

    const likelihoodScore = likelihoodScores[likelihood] || 3;
    const impactScore = impactScores[impact] || 3;

    // Calculate risk score on a scale of 1-100
    return (likelihoodScore * impactScore * 100) / 25;
  }

  async findStps(poamId: number) {
    const poamStps = await this.prisma.poamStp.findMany({
      where: { poamId },
      include: {
        stp: {
          include: {
            system: true,
            assignedTeam: true,
            testCases: true,
            evidence: true,
          },
        },
      },
    });

    return {
      items: poamStps.map((poamStp) => ({
        ...poamStp.stp,
        contributionPercentage: poamStp.contributionPercentage,
      })),
    };
  }
}