import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CciMapperService } from '../../services/cci-mapper.service';
import { StigImportService } from '../../services/stig-import.service';
import { ScoringService } from '../../services/scoring.service';

export interface StigImportJobData {
  systemId: number;
  filename: string;
  fileContent: string;
  userId: number;
}

@Processor('stig-import')
@Injectable()
export class StigImportProcessor extends WorkerHost {
  private readonly logger = new Logger(StigImportProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cciMapper: CciMapperService,
    private readonly stigImportService: StigImportService,
    private readonly scoringService: ScoringService,
  ) {
    super();
  }

  async process(job: Job<StigImportJobData>): Promise<any> {
    const { systemId, filename, fileContent, userId } = job.data;

    this.logger.log(`Starting STIG import for system ${systemId}, file: ${filename}`);

    try {
      let progress = 0;
      await job.updateProgress(progress);

      // 1. Parse STIG scan file
      this.logger.log('Parsing STIG scan file...');
      const findings = await this.stigImportService.parseStigScan(fileContent, filename);
      progress = 20;
      await job.updateProgress(progress);

      this.logger.log(`Parsed ${findings.length} findings from STIG scan`);

      // 2. Create scan record
      this.logger.log('Creating scan record...');
      const scanId = await this.stigImportService.createStigScan(
        systemId,
        filename,
        userId,
        findings.length,
      );
      progress = 30;
      await job.updateProgress(progress);

      // 3. Save findings in batches
      this.logger.log('Saving STIG findings...');
      await this.stigImportService.saveStigFindings(scanId, systemId, findings);
      progress = 70;
      await job.updateProgress(progress);

      // 4. Calculate system scores
      this.logger.log('Calculating system scores...');
      const scores = await this.stigImportService.calculateSystemScore(systemId, scanId);
      progress = 90;
      await job.updateProgress(progress);

      // 5. Update control system status
      this.logger.log('Updating control system status...');
      await this.stigImportService.updateControlSystemStatus(systemId, scanId);
      progress = 95;
      await job.updateProgress(progress);

      // 6. Calculate group and package scores
      this.logger.log('Updating group and package scores...');
      const system = await this.prisma.system.findUnique({
        where: { id: systemId },
        select: { groupId: true, packageId: true },
      });

      if (system?.groupId) {
        await this.scoringService.calculateGroupScore(system.groupId);
        await this.scoringService.updateControlGroupStatus(system.groupId);
      }

      if (system?.packageId) {
        await this.scoringService.calculatePackageScore(system.packageId);
      }

      progress = 100;
      await job.updateProgress(progress);

      const result = {
        scanId,
        totalFindings: findings.length,
        mappedControls: findings.filter(f => f.controlId).length,
        openFindings: findings.filter(f => f.status === 'Open').length,
        notReviewedFindings: findings.filter(f => f.status === 'Not_Reviewed').length,
        scores,
      };

      this.logger.log(`STIG import completed successfully for system ${systemId}`);
      return result;

    } catch (error) {
      this.logger.error(`STIG import failed for system ${systemId}:`, error);
      throw new Error(`STIG import failed: ${error.message}`);
    }
  }
}