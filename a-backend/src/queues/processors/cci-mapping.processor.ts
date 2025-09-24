import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CciMapperService } from '../../services/cci-mapper.service';

export interface CciMappingJobData {
  scanId: number;
  systemId: number;
}

@Processor('cci-mapping')
@Injectable()
export class CciMappingProcessor extends WorkerHost {
  private readonly logger = new Logger(CciMappingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cciMapper: CciMapperService,
  ) {
    super();
  }

  async process(job: Job<CciMappingJobData>): Promise<any> {
    const { scanId, systemId } = job.data;

    this.logger.log(`Starting CCI mapping for scan ${scanId}, system ${systemId}`);

    try {
      let progress = 0;
      await job.updateProgress(progress);

      // Get all findings from the scan that have CCI but no control mapping
      const findings = await this.prisma.stigFinding.findMany({
        where: {
          scanId,
          systemId,
          cci: { not: null },
          controlId: null,
        },
      });

      this.logger.log(`Found ${findings.length} findings to map`);

      if (findings.length === 0) {
        return { mappedCount: 0 };
      }

      let mappedCount = 0;
      const batchSize = 50;

      for (let i = 0; i < findings.length; i += batchSize) {
        const batch = findings.slice(i, i + batchSize);
        const updates: Promise<any>[] = [];

        for (const finding of batch) {
          if (finding.cci) {
            const controlId = this.cciMapper.mapCciToControl(finding.cci);
            if (controlId) {
              updates.push(
                this.prisma.stigFinding.update({
                  where: { id: finding.id },
                  data: { controlId },
                })
              );
              mappedCount++;
            }
          }
        }

        // Execute batch updates
        if (updates.length > 0) {
          await Promise.all(updates);
        }

        progress = Math.round(((i + batch.length) / findings.length) * 100);
        await job.updateProgress(progress);
      }

      // Update control system status after mapping
      await this.updateControlSystemStatus(systemId, scanId);

      this.logger.log(`CCI mapping completed. Mapped ${mappedCount} findings to controls`);

      return {
        totalFindings: findings.length,
        mappedCount,
      };

    } catch (error) {
      this.logger.error(`CCI mapping failed for scan ${scanId}:`, error);
      throw new Error(`CCI mapping failed: ${error.message}`);
    }
  }

  private async updateControlSystemStatus(systemId: number, scanId: number): Promise<void> {
    // Get all findings mapped to controls
    const findings = await this.prisma.stigFinding.findMany({
      where: {
        scanId,
        systemId,
        controlId: { not: null },
      },
    });

    // Group findings by control
    const controlFindings = new Map<string, any[]>();
    for (const finding of findings) {
      if (finding.controlId) {
        if (!controlFindings.has(finding.controlId)) {
          controlFindings.set(finding.controlId, []);
        }
        controlFindings.get(finding.controlId)!.push(finding);
      }
    }

    // Update control status for each control
    for (const [controlId, controlFindingList] of Array.from(controlFindings.entries())) {
      const openCount = controlFindingList.filter(f => f.status === 'Open').length;
      const criticalCount = controlFindingList.filter(
        f => f.status === 'Open' && f.severity === 'CAT_I',
      ).length;

      await this.prisma.controlSystemStatus.upsert({
        where: {
          controlId_systemId: {
            controlId,
            systemId,
          },
        },
        update: {
          hasFindings: controlFindingList.length > 0,
          openCount,
          criticalCount,
          lastAssessed: new Date(),
        },
        create: {
          controlId,
          systemId,
          hasFindings: controlFindingList.length > 0,
          openCount,
          criticalCount,
          lastAssessed: new Date(),
        },
      });
    }
  }
}