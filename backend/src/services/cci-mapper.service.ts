import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { parseStringPromise } from 'xml2js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

export interface CciMapping {
  cci: string;
  definition: string;
  controlId: string;
  controlTitle?: string;
}

export interface StigFindingWithControl {
  ruleId: string;
  vulnId: string;
  title: string;
  severity: string;
  status: string;
  cci?: string;
  controlId?: string;
  description?: string;
  checkContent?: string;
  fixText?: string;
}

@Injectable()
export class CciMapperService implements OnModuleInit {
  private readonly logger = new Logger(CciMapperService.name);
  private cciMappings: Map<string, CciMapping> = new Map();
  private initialized = false;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.loadCciMappings();
  }

  async loadCciMappings(): Promise<void> {
    try {
      // Check if mappings are already in database
      const existingMappings = await this.prisma.cciControlMapping.count();

      if (existingMappings > 0) {
        this.logger.log(`Loading ${existingMappings} CCI mappings from database`);
        await this.loadFromDatabase();
      } else {
        this.logger.log('No CCI mappings found in database, loading from XML file');
        await this.loadFromXmlFile();
      }

      this.initialized = true;
      this.logger.log(`CCI Mapper initialized with ${this.cciMappings.size} mappings`);
    } catch (error) {
      this.logger.error('Failed to load CCI mappings:', error);
      throw error;
    }
  }

  private async loadFromDatabase(): Promise<void> {
    const mappings = await this.prisma.cciControlMapping.findMany();

    for (const mapping of mappings) {
      this.cciMappings.set(mapping.cci, {
        cci: mapping.cci,
        definition: mapping.definition,
        controlId: mapping.controlId,
        controlTitle: mapping.controlTitle,
      });
    }
  }

  private async loadFromXmlFile(): Promise<void> {
    const xmlPath = path.join(process.cwd(), '..', 'example-data', 'U_CCI_List.xml');

    try {
      const xmlContent = await fs.readFile(xmlPath, 'utf8');
      const parsed = await parseStringPromise(xmlContent);

      if (!parsed.cci_list || !parsed.cci_list.cci_items) {
        throw new Error('Invalid CCI XML structure');
      }

      const cciItems = parsed.cci_list.cci_items[0].cci_item || [];
      const mappingsToCreate: any[] = [];

      for (const item of cciItems) {
        const cciId = item.$.id;
        const definition = item.definition?.[0] || '';
        const references = item.references?.[0]?.reference || [];

        // Look for NIST SP 800-53 references
        for (const ref of references) {
          if (ref.$.title?.includes('NIST') && ref.$.index) {
            const controlId = ref.$.index;
            const controlTitle = ref.$.title || '';

            const mapping: CciMapping = {
              cci: cciId,
              definition,
              controlId,
              controlTitle,
            };

            this.cciMappings.set(cciId, mapping);

            mappingsToCreate.push({
              cci: cciId,
              definition,
              controlId,
              controlTitle,
            });

            break; // Use first NIST reference found
          }
        }
      }

      // Store mappings in database for future use
      if (mappingsToCreate.length > 0) {
        await this.prisma.cciControlMapping.createMany({
          data: mappingsToCreate,
          skipDuplicates: true,
        });
        this.logger.log(`Stored ${mappingsToCreate.length} CCI mappings in database`);
      }
    } catch (error) {
      this.logger.error('Error loading CCI XML file:', error);
      // Continue without mappings if file not found
      this.logger.warn('Continuing without CCI mappings - controls will not be mapped');
    }
  }

  mapCciToControl(cci: string): string | null {
    if (!this.initialized) {
      this.logger.warn('CCI Mapper not yet initialized');
      return null;
    }

    const mapping = this.cciMappings.get(cci);
    return mapping?.controlId || null;
  }

  mapMultipleCcisToControl(ccis: string[]): Map<string, string> {
    const controlMap = new Map<string, string>();

    for (const cci of ccis) {
      const controlId = this.mapCciToControl(cci);
      if (controlId) {
        controlMap.set(cci, controlId);
      }
    }

    return controlMap;
  }

  getMapping(cci: string): CciMapping | null {
    return this.cciMappings.get(cci) || null;
  }

  getAllMappings(): Map<string, CciMapping> {
    return new Map(this.cciMappings);
  }

  async refreshMappings(): Promise<void> {
    this.cciMappings.clear();
    this.initialized = false;
    await this.loadCciMappings();
  }

  parseStigFinding(finding: any): StigFindingWithControl {
    const cci = finding.cci_ref || finding.cci || null;
    const controlId = cci ? this.mapCciToControl(cci) : null;

    return {
      ruleId: finding.rule_id || finding.ruleId,
      vulnId: finding.vuln_id || finding.vulnId,
      title: finding.rule_title || finding.title || '',
      severity: this.normalizeSeverity(finding.severity || finding.cat),
      status: this.normalizeStatus(finding.status),
      cci,
      controlId: controlId || undefined,
      description: finding.vuln_discuss || finding.description,
      checkContent: finding.check_content,
      fixText: finding.fix_text,
    };
  }

  private normalizeSeverity(severity: string): string {
    const normalized = severity?.toUpperCase() || '';

    if (normalized.includes('CAT') && normalized.includes('I')) {
      if (normalized.includes('III')) return 'CAT_III';
      if (normalized.includes('II')) return 'CAT_II';
      return 'CAT_I';
    }

    switch (normalized) {
      case 'HIGH':
      case '1':
        return 'CAT_I';
      case 'MEDIUM':
      case '2':
        return 'CAT_II';
      case 'LOW':
      case '3':
        return 'CAT_III';
      default:
        return 'CAT_II'; // Default to medium
    }
  }

  private normalizeStatus(status: string): string {
    const normalized = status?.toLowerCase() || '';

    if (normalized.includes('open')) return 'Open';
    if (normalized.includes('not_a_finding') || normalized.includes('notafinding')) return 'Not_a_Finding';
    if (normalized.includes('not_applicable') || normalized.includes('notapplicable')) return 'Not_Applicable';
    if (normalized.includes('not_reviewed') || normalized.includes('notreviewed')) return 'Not_Reviewed';

    return 'Not_Reviewed'; // Default to not reviewed
  }
}