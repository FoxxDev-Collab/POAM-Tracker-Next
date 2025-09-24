import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

interface CCI {
  cci: string;
  definition: string;
}

interface ControlData {
  name: string;
  controlText: string;
  discussion?: string;
  relatedControls?: string[];
  ccis?: CCI[];
}

interface CatalogData {
  [controlId: string]: ControlData;
}

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(private prisma: PrismaService) {}

  async importCatalogFromFile(filePath?: string): Promise<{ imported: number; errors: string[] }> {
    const catalogPath = filePath || path.join(process.cwd(), '..', 'example-data', 'catalog.json');
    
    this.logger.log(`Importing catalog from: ${catalogPath}`);
    
    if (!fs.existsSync(catalogPath)) {
      throw new Error(`Catalog file not found at: ${catalogPath}`);
    }

    try {
      const catalogData: CatalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      return await this.importCatalogData(catalogData);
    } catch (error) {
      this.logger.error('Failed to import catalog:', error);
      throw new Error(`Failed to import catalog: ${error.message}`);
    }
  }

  private async importCatalogData(catalogData: CatalogData): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    // First, clear existing catalog data
    await this.clearExistingCatalog();

    // Import controls in transaction
    await this.prisma.$transaction(async (tx) => {
      // First pass: Create all controls
      for (const [controlId, controlData] of Object.entries(catalogData)) {
        try {
          await tx.nistControl.create({
            data: {
              controlId,
              name: controlData.name,
              controlText: controlData.controlText,
              discussion: controlData.discussion || null,
            },
          });
          imported++;
        } catch (error) {
          errors.push(`Failed to import control ${controlId}: ${error.message}`);
          this.logger.error(`Failed to import control ${controlId}:`, error);
        }
      }

      // Second pass: Create relationships and CCIs
      for (const [controlId, controlData] of Object.entries(catalogData)) {
        try {
          const control = await tx.nistControl.findUnique({
            where: { controlId },
          });

          if (!control) {
            errors.push(`Control ${controlId} not found for relationships`);
            continue;
          }

          // Create related controls
          if (controlData.relatedControls && controlData.relatedControls.length > 0) {
            for (const relatedControlId of controlData.relatedControls) {
              try {
                await tx.nistControlRelation.create({
                  data: {
                    sourceControlId: control.id,
                    relatedControlId: relatedControlId.trim(),
                  },
                });
              } catch (error) {
                // Skip duplicate relations
                if (!error.message.includes('Unique constraint')) {
                  errors.push(`Failed to create relation ${controlId} -> ${relatedControlId}: ${error.message}`);
                }
              }
            }
          }

          // Create CCIs
          if (controlData.ccis && controlData.ccis.length > 0) {
            for (const cci of controlData.ccis) {
              try {
                await tx.nistControlCci.create({
                  data: {
                    controlId: control.id,
                    cci: cci.cci,
                    definition: cci.definition,
                  },
                });
              } catch (error) {
                // Skip duplicate CCIs
                if (!error.message.includes('Unique constraint')) {
                  errors.push(`Failed to create CCI ${cci.cci} for ${controlId}: ${error.message}`);
                }
              }
            }
          }
        } catch (error) {
          errors.push(`Failed to process relationships for ${controlId}: ${error.message}`);
          this.logger.error(`Failed to process relationships for ${controlId}:`, error);
        }
      }
    });

    this.logger.log(`Catalog import completed. Imported: ${imported}, Errors: ${errors.length}`);
    return { imported, errors };
  }

  private async clearExistingCatalog(): Promise<void> {
    this.logger.log('Clearing existing catalog data...');
    
    // Delete in correct order due to foreign key constraints
    await this.prisma.nistControlCci.deleteMany();
    await this.prisma.nistControlRelation.deleteMany();
    await this.prisma.nistControl.deleteMany();
    
    this.logger.log('Existing catalog data cleared');
  }

  async getAllControls(page = 1, limit = 50, search?: string, family?: string) {
    const skip = (page - 1) * limit;
    
    const where = {
      AND: [
        search
          ? {
              OR: [
                { controlId: { contains: search, mode: 'insensitive' as const } },
                { name: { contains: search, mode: 'insensitive' as const } },
                { controlText: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {},
        family
          ? { controlId: { startsWith: family, mode: 'insensitive' as const } }
          : {},
      ],
    };

    const [controls, total] = await Promise.all([
      this.prisma.nistControl.findMany({
        where,
        skip,
        take: limit,
        include: {
          ccis: true,
          relatedControls: true,
        },
      }),
      this.prisma.nistControl.count({ where }),
    ]);

    // Sort controls properly by family and number
    const sortedControls = controls.sort((a, b) => {
      const parseControlId = (id: string) => {
        const match = id.match(/^([A-Z]+)-(\d+)(\((\d+)\))?$/);
        if (!match) return { family: id, number: 0, enhancement: 0 };
        return {
          family: match[1],
          number: parseInt(match[2], 10),
          enhancement: match[4] ? parseInt(match[4], 10) : 0,
        };
      };

      const aControl = parseControlId(a.controlId);
      const bControl = parseControlId(b.controlId);

      // First sort by family
      if (aControl.family !== bControl.family) {
        return aControl.family.localeCompare(bControl.family);
      }

      // Then by number
      if (aControl.number !== bControl.number) {
        return aControl.number - bControl.number;
      }

      // Finally by enhancement
      return aControl.enhancement - bControl.enhancement;
    });

    return {
      controls: sortedControls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getControlById(controlId: string) {
    return this.prisma.nistControl.findUnique({
      where: { controlId },
      include: {
        ccis: true,
        relatedControls: true,
      },
    });
  }

  async getControlByIdWithDetails(controlId: string) {
    const control = await this.prisma.nistControl.findUnique({
      where: { controlId },
      include: {
        ccis: true,
        relatedControls: true,
      },
    });

    if (!control) {
      return null;
    }

    return {
      control,
      ccis: control.ccis,
      relatedControls: control.relatedControls,
    };
  }

  async getControlStats() {
    const [totalControls, totalCcis, totalRelations] = await Promise.all([
      this.prisma.nistControl.count(),
      this.prisma.nistControlCci.count(),
      this.prisma.nistControlRelation.count(),
    ]);

    return {
      totalControls,
      totalCcis,
      totalRelations,
    };
  }

  async getStats() {
    const totalControls = await this.prisma.nistControl.count();
    const totalCcis = await this.prisma.nistControlCci.count();
    const totalRelations = await this.prisma.nistControlRelation.count();

    // Get compliance status counts for controls
    const controlComplianceStats = await this.prisma.nistControl.groupBy({
      by: ['complianceStatus'],
      _count: {
        complianceStatus: true,
      },
    });

    // Get compliance status counts for CCIs
    const cciComplianceStats = await this.prisma.nistControlCci.groupBy({
      by: ['complianceStatus'],
      _count: {
        complianceStatus: true,
      },
    });

    return {
      totalControls,
      totalCcis,
      totalRelations,
      controlComplianceStats,
      cciComplianceStats,
    };
  }

  async updateControlCompliance(
    controlId: string,
    complianceStatus: string,
    complianceNotes?: string,
    assessedBy?: number,
  ) {
    const control = await this.prisma.nistControl.findUnique({
      where: { controlId },
    });

    if (!control) {
      throw new Error(`Control ${controlId} not found`);
    }

    return this.prisma.nistControl.update({
      where: { controlId },
      data: {
        complianceStatus: complianceStatus as any,
        complianceNotes,
        assessedBy,
        assessedAt: new Date(),
      },
      include: {
        ccis: true,
        relatedControls: true,
      },
    });
  }

  async updateCciCompliance(
    cciId: string,
    complianceStatus: string,
    complianceNotes?: string,
    assessedBy?: number,
  ) {
    // Find CCI by the CCI identifier (e.g., "CCI-000001")
    const cci = await this.prisma.nistControlCci.findFirst({
      where: { cci: cciId },
    });

    if (!cci) {
      throw new Error(`CCI ${cciId} not found`);
    }

    return this.prisma.nistControlCci.update({
      where: { id: cci.id },
      data: {
        complianceStatus: complianceStatus as any,
        complianceNotes,
        assessedBy,
        assessedAt: new Date(),
      },
      include: {
        control: true,
      },
    });
  }
}
