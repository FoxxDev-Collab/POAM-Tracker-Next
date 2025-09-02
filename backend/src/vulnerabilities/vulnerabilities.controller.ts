import { Controller, Get, Post, Body, Patch, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { VulnerabilitiesService } from './vulnerabilities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('vulnerabilities')
@UseGuards(JwtAuthGuard)
export class VulnerabilitiesController {
  constructor(private readonly vulnerabilitiesService: VulnerabilitiesService) {}

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
}

@Controller('systems')
@UseGuards(JwtAuthGuard)
export class SystemsStigController {
  constructor(private readonly vulnerabilitiesService: VulnerabilitiesService) {}

  @Get(':id/stig/scans')
  findScans(@Param('id', ParseIntPipe) systemId: number) {
    return this.vulnerabilitiesService.findScans(systemId);
  }

  @Post(':id/stig/scans')
  createScan(
    @Param('id', ParseIntPipe) systemId: number,
    @Body() createScanDto: { title?: string; checklistId?: string }
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
    @Body() body: { data: any }
  ) {
    // Create a new scan
    const scan = await this.vulnerabilitiesService.createScan(systemId, {
      title: body.data.title || `STIG Scan - ${new Date().toISOString().split('T')[0]}`,
      checklistId: body.data.checklistId,
    });

    // Extract findings from CKLB data
    const findings = body.data.findings || body.data.vulns || [];
    
    // Create findings in bulk
    return this.vulnerabilitiesService.createFindings(scan.id, systemId, findings);
  }
}
