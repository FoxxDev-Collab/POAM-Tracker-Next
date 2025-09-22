import { Controller, Get, Post, Put, Body, Query, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CatalogService } from './catalog.service';
import { ControlComplianceService } from '../services/control-compliance.service';
import { PackageBaselineService } from './package-baseline.service';
import { User, ComplianceStatus } from '@prisma/client';

@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly controlComplianceService: ControlComplianceService,
    private readonly packageBaselineService: PackageBaselineService,
  ) {}

  @Post('import')
  async importCatalog(@Query('filePath') filePath?: string) {
    try {
      const result = await this.catalogService.importCatalogFromFile(filePath);
      return {
        success: true,
        message: `Successfully imported ${result.imported} controls`,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to import catalog',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('controls')
  async getControls(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('search') search?: string,
    @Query('family') family?: string,
  ) {
    try {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      
      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        throw new HttpException(
          'Invalid pagination parameters',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.catalogService.getAllControls(pageNum, limitNum, search, family);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch controls',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('controls/:controlId')
  async getControl(@Param('controlId') controlId: string) {
    try {
      const control = await this.catalogService.getControlById(controlId);
      
      if (!control) {
        throw new HttpException(
          `Control ${controlId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: control,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch control',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  async getStats() {
    try {
      const stats = await this.catalogService.getStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch catalog statistics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('controls/:controlId/compliance')
  @UseGuards(JwtAuthGuard)
  async updateControlCompliance(
    @Param('controlId') controlId: string,
    @Body() updateData: {
      complianceStatus: string;
      complianceNotes?: string;
    }
  ) {
    try {
      const result = await this.catalogService.updateControlCompliance(
        controlId,
        updateData.complianceStatus,
        updateData.complianceNotes,
        1 // TODO: Get actual user ID from auth context
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update control compliance status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('ccis/:cciId/compliance')
  @UseGuards(JwtAuthGuard)
  async updateCciCompliance(
    @Param('cciId') cciId: string,
    @Body() updateData: {
      complianceStatus: string;
      complianceNotes?: string;
    }
  ) {
    try {
      const result = await this.catalogService.updateCciCompliance(
        cciId,
        updateData.complianceStatus,
        updateData.complianceNotes,
        1 // TODO: Get actual user ID from auth context
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update CCI compliance status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('controls/compliance-summary')
  async getControlComplianceSummary(@Query('controlId') controlId?: string) {
    try {
      const summary = await this.controlComplianceService.getControlComplianceSummary(controlId);
      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get control compliance summary',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('controls/update-compliance-from-stig')
  async updateControlComplianceFromStig(@Query('controlId') controlId?: string) {
    try {
      await this.controlComplianceService.updateControlComplianceFromStigFindings(controlId);
      return {
        success: true,
        message: controlId 
          ? `Successfully updated compliance for control ${controlId}`
          : 'Successfully updated compliance for all controls with STIG findings',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update control compliance',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('controls/:controlId/compliance-score')
  async getControlComplianceScore(@Param('controlId') controlId: string) {
    try {
      const score = await this.controlComplianceService.calculateControlComplianceScore(controlId);
      if (!score) {
        throw new HttpException(
          {
            success: false,
            message: `No STIG findings found for control ${controlId}`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: score,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to calculate control compliance score',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Package Baseline Management Endpoints

  @Post('packages/:packageId/baseline/initialize')
  @UseGuards(JwtAuthGuard)
  async initializePackageBaseline(
    @Param('packageId') packageId: string,
    @Body() body: { baselineLevel: 'Low' | 'Moderate' | 'High' }
  ) {
    try {
      const result = await this.packageBaselineService.initializePackageBaseline(
        parseInt(packageId, 10),
        body.baselineLevel,
        1 // TODO: Get actual user ID from auth context
      );
      return {
        success: true,
        message: `Successfully initialized ${body.baselineLevel} baseline for package`,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to initialize package baseline',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('packages/:packageId/baseline')
  async getPackageBaseline(@Param('packageId') packageId: string) {
    try {
      const baseline = await this.packageBaselineService.getPackageBaseline(parseInt(packageId, 10));
      return {
        success: true,
        data: baseline,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch package baseline',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('packages/:packageId/baseline/:controlId')
  @UseGuards(JwtAuthGuard)
  async updatePackageBaselineControl(
    @Param('packageId') packageId: string,
    @Param('controlId') controlId: string,
    @Body() updates: {
      includeInBaseline?: boolean;
      tailoringAction?: string;
      tailoringRationale?: string;
      implementationStatus?: string;
      implementationNotes?: string;
      complianceStatus?: ComplianceStatus;
      complianceNotes?: string;
    }
  ) {
    try {
      const result = await this.packageBaselineService.updateBaselineControl(
        parseInt(packageId, 10),
        controlId,
        updates,
        1 // TODO: Get actual user ID from auth context
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update baseline control',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('packages/:packageId/baseline/bulk-update')
  @UseGuards(JwtAuthGuard)
  async bulkUpdatePackageBaseline(
    @Param('packageId') packageId: string,
    @Body() body: {
      controls: Array<{
        controlId: string;
        includeInBaseline?: boolean;
        implementationStatus?: string;
        complianceStatus?: ComplianceStatus;
        tailoringAction?: string;
        tailoringRationale?: string;
        implementationNotes?: string;
        complianceNotes?: string;
      }>;
    }
  ) {
    try {
      const results = await this.packageBaselineService.bulkUpdateBaseline(
        parseInt(packageId, 10),
        body.controls,
        1 // TODO: Get actual user ID from auth context
      );
      return {
        success: true,
        message: `Successfully updated ${results.length} controls`,
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to bulk update baseline',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('packages/:packageId/compliance-summary')
  async getPackageComplianceSummary(@Param('packageId') packageId: string) {
    try {
      const summary = await this.packageBaselineService.getPackageComplianceSummary(parseInt(packageId, 10));
      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch package compliance summary',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('packages/:packageId/control-status')
  async getPackageControlStatus(@Param('packageId') packageId: string) {
    try {
      const controlStatus = await this.packageBaselineService.getPackageControlStatusByFamily(parseInt(packageId, 10));
      return {
        success: true,
        data: controlStatus,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch package control status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('controls/:controlId/cci-compliance')
  async getControlCciCompliance(
    @Param('controlId') controlId: string,
    @Query('packageId') packageId?: string,
  ) {
    try {
      const cciCompliance = await this.controlComplianceService.getControlCciCompliance(
        controlId,
        packageId ? parseInt(packageId, 10) : undefined,
      );
      return {
        success: true,
        data: cciCompliance,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch CCI compliance data',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('packages/:packageId/stig-mapped-controls')
  async getStigMappedControls(@Param('packageId') packageId: string) {
    try {
      const stigMappedControls = await this.packageBaselineService.getStigMappedControls(parseInt(packageId, 10));
      return {
        success: true,
        data: stigMappedControls,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch STIG mapped controls',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('controls/:controlId/package-findings')
  async getControlPackageFindings(
    @Param('controlId') controlId: string,
    @Query('packageId') packageId: string
  ) {
    try {
      if (!packageId) {
        throw new HttpException(
          'Package ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const findings = await this.packageBaselineService.getControlPackageFindings(
        controlId,
        parseInt(packageId, 10)
      );

      if (!findings) {
        throw new HttpException(
          `Control ${controlId} or package ${packageId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: findings,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch control package findings',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
