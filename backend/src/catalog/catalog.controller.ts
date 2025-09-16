import { Controller, Get, Post, Put, Body, Query, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CatalogService } from './catalog.service';
import { User } from '@prisma/client';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

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
}
