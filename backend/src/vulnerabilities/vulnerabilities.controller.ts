import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VulnerabilitiesService } from './vulnerabilities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('vulnerabilities')
@UseGuards(JwtAuthGuard)
export class VulnerabilitiesController {
  constructor(
    private readonly vulnerabilitiesService: VulnerabilitiesService,
  ) {}

  @Get()
  findAll(
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('system_id') systemId?: string,
    @Query('group_id') groupId?: string,
  ) {
    return this.vulnerabilitiesService.findAll({
      severity,
      status,
      systemId: systemId ? parseInt(systemId) : undefined,
      groupId: groupId ? parseInt(groupId) : undefined,
    });
  }

  @Get('systems')
  findBySystemsQuery(
    @Query('system_id') systemId?: string,
    @Query('group_id') groupId?: string,
  ) {
    if (systemId) {
      return this.vulnerabilitiesService.findBySystem(parseInt(systemId));
    }
    if (groupId) {
      return this.vulnerabilitiesService.findByGroup(parseInt(groupId));
    }
    return this.vulnerabilitiesService.findAll();
  }

  // Put specific routes first to avoid conflicts
  @Get('reports')
  async getNessusReports(@Query() query: any) {
    console.log('=== REPORTS ENDPOINT HIT ===');
    console.log('Reports request query:', query);
    
    const packageId = query.package_id;
    const systemId = query.system_id;
    
    const parsedPackageId = packageId && !isNaN(parseInt(packageId)) ? parseInt(packageId) : undefined;
    const parsedSystemId = systemId && !isNaN(parseInt(systemId)) ? parseInt(systemId) : undefined;
    
    console.log('Parsed - packageId:', parsedPackageId, 'systemId:', parsedSystemId);
    
    return this.vulnerabilitiesService.findNessusReports({
      packageId: parsedPackageId,
      systemId: parsedSystemId,
    });
  }

  @Get('nessus/stats')
  async getNessusStats(@Query() query: any) {
    console.log('Nessus stats request query:', query);
    
    return this.vulnerabilitiesService.getNessusVulnerabilityStats({
      packageId: query.package_id ? parseInt(query.package_id) : undefined,
      systemId: query.system_id ? parseInt(query.system_id) : undefined,
      reportId: query.report_id ? parseInt(query.report_id) : undefined,
    });
  }

  @Get('nessus')
  async getNessusVulnerabilities(@Query() query: any) {
    console.log('=== NESSUS ENDPOINT HIT ===');
    console.log('Nessus vulnerabilities request query:', query);
    
    const reportId = query.report_id;
    const hostId = query.host_id;
    const severity = query.severity;
    const pluginFamily = query.plugin_family;
    const limit = query.limit;
    const offset = query.offset;
    const systemId = query.system_id;
    
    // Handle system_id by finding reports for that system first
    let finalReportId = reportId;
    
    if (systemId && !reportId) {
      console.log('Looking for reports for system:', systemId);
      const systemReports = await this.vulnerabilitiesService.findNessusReports({
        systemId: parseInt(systemId),
      });
      console.log('Found reports:', systemReports.length);
      if (systemReports.length > 0) {
        finalReportId = systemReports[0].id.toString();
        console.log('Using report ID:', finalReportId);
      }
    }

    return this.vulnerabilitiesService.findNessusVulnerabilities({
      reportId: finalReportId && !isNaN(parseInt(finalReportId)) ? parseInt(finalReportId) : undefined,
      hostId: hostId && !isNaN(parseInt(hostId)) ? parseInt(hostId) : undefined,
      severity: severity && !isNaN(parseInt(severity)) ? parseInt(severity) : undefined,
      plugin_family: pluginFamily,
      limit: limit && !isNaN(parseInt(limit)) ? parseInt(limit) : 100,
      offset: offset && !isNaN(parseInt(offset)) ? parseInt(offset) : 0,
    });
  }

  @Get('reports/:id')
  async getNessusReport(@Param('id', ParseIntPipe) id: number) {
    return this.vulnerabilitiesService.findNessusReportById(id);
  }

  @Get('group/:groupId')
  async getGroupMetrics(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.vulnerabilitiesService.getGroupVulnerabilityMetrics(groupId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vulnerabilitiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateData: any) {
    return this.vulnerabilitiesService.update(id, updateData);
  }

  // Nessus file upload endpoint
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadNessusFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
        ],
      }),
    )
    file: any,
    @Body('package_id') packageId?: string,
    @Body('system_id') systemId?: string,
  ) {
    // Validate file extension manually since MIME type detection is unreliable for .nessus files
    if (!file.originalname?.toLowerCase().endsWith('.nessus') && !file.originalname?.toLowerCase().endsWith('.xml')) {
      throw new Error('Invalid file type. Only .nessus and .xml files are supported.');
    }

    return this.vulnerabilitiesService.processNessusUpload(
      file.buffer,
      file.originalname,
      packageId ? parseInt(packageId) : undefined,
      systemId ? parseInt(systemId) : undefined,
    );
  }

  // Legacy import endpoint (for direct JSON data)
  @Post('import')
  async importNessusData(@Body() importData: any) {
    return this.vulnerabilitiesService.importNessusData(importData);
  }


  // TEMPORARY: Cleanup all Nessus data for testing
  @Delete('cleanup/all')
  async cleanupAllNessusData() {
    return this.vulnerabilitiesService.cleanupAllNessusData();
  }

  @Delete('reports/:id')
  async deleteNessusReport(@Param('id', ParseIntPipe) id: number) {
    return this.vulnerabilitiesService.deleteNessusReport(id);
  }

}

@Controller('systems')
@UseGuards(JwtAuthGuard)
export class SystemsStigController {
  constructor(
    private readonly vulnerabilitiesService: VulnerabilitiesService,
  ) {}

  @Get(':id/stig/scans')
  findScans(@Param('id', ParseIntPipe) systemId: number) {
    return this.vulnerabilitiesService.findScans(systemId);
  }

  @Post(':id/stig/scans')
  createScan(
    @Param('id', ParseIntPipe) systemId: number,
    @Body() createScanDto: { title?: string; checklistId?: string },
  ) {
    return this.vulnerabilitiesService.createScan(systemId, createScanDto);
  }

  @Get(':id/stig/findings')
  findFindings(@Param('id', ParseIntPipe) systemId: number) {
    return this.vulnerabilitiesService.findBySystem(systemId);
  }

  @Post(':id/cklb')
  async uploadCklb(
    @Param('id', ParseIntPipe) systemId: number,
    @Body() body: { data: any },
  ) {
    // Create a new scan
    const scan = await this.vulnerabilitiesService.createScan(systemId, {
      title:
        body.data.title ||
        `STIG Scan - ${new Date().toISOString().split('T')[0]}`,
      checklistId: body.data.checklistId,
    });

    // Extract findings from CKLB data
    const findings = body.data.findings || body.data.vulns || [];

    // Create findings in bulk
    return this.vulnerabilitiesService.createFindings(
      scan.id,
      systemId,
      findings,
    );
  }
}
