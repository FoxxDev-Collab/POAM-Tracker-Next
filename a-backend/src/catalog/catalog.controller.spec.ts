import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ControlComplianceService } from '../services/control-compliance.service';
import { PackageBaselineService } from './package-baseline.service';
import { HttpException } from '@nestjs/common';

describe('CatalogController', () => {
  let controller: CatalogController;
  let catalogService: CatalogService;
  let controlComplianceService: ControlComplianceService;
  let packageBaselineService: PackageBaselineService;

  const mockControl = {
    id: 1,
    controlId: 'AC-1',
    name: 'Access Control Policy',
    controlText: 'Test control text',
    family: 'AC',
  };

  const mockCatalogService = {
    importCatalogFromFile: jest.fn(),
    getAllControls: jest.fn(),
    getControlById: jest.fn(),
    getControlFamilies: jest.fn(),
    searchControls: jest.fn(),
  };

  const mockControlComplianceService = {
    getPackageCompliance: jest.fn(),
    updateControlStatus: jest.fn(),
  };

  const mockPackageBaselineService = {
    getPackageBaseline: jest.fn(),
    updatePackageBaseline: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        {
          provide: CatalogService,
          useValue: mockCatalogService,
        },
        {
          provide: ControlComplianceService,
          useValue: mockControlComplianceService,
        },
        {
          provide: PackageBaselineService,
          useValue: mockPackageBaselineService,
        },
      ],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
    catalogService = module.get<CatalogService>(CatalogService);
    controlComplianceService = module.get<ControlComplianceService>(
      ControlComplianceService,
    );
    packageBaselineService = module.get<PackageBaselineService>(
      PackageBaselineService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importCatalog', () => {
    it('should import catalog successfully', async () => {
      const importResult = { imported: 100, errors: [] };
      mockCatalogService.importCatalogFromFile.mockResolvedValue(importResult);

      const result = await controller.importCatalog();

      expect(result.success).toBe(true);
      expect(result.message).toContain('100');
      expect(catalogService.importCatalogFromFile).toHaveBeenCalled();
    });

    it('should import catalog from custom file path', async () => {
      const importResult = { imported: 50, errors: [] };
      mockCatalogService.importCatalogFromFile.mockResolvedValue(importResult);

      await controller.importCatalog('/custom/path.json');

      expect(catalogService.importCatalogFromFile).toHaveBeenCalledWith(
        '/custom/path.json',
      );
    });

    it('should handle import errors', async () => {
      mockCatalogService.importCatalogFromFile.mockRejectedValue(
        new Error('Import failed'),
      );

      await expect(controller.importCatalog()).rejects.toThrow(HttpException);
    });
  });

  describe('getControls', () => {
    it('should return paginated controls', async () => {
      const controls = {
        items: [mockControl],
        total: 1,
        page: 1,
        limit: 50,
      };
      mockCatalogService.getAllControls.mockResolvedValue(controls);

      const result = await controller.getControls();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(controls);
      expect(catalogService.getAllControls).toHaveBeenCalledWith(1, 50, undefined, undefined);
    });

    it('should handle pagination parameters', async () => {
      mockCatalogService.getAllControls.mockResolvedValue({
        items: [],
        total: 0,
        page: 2,
        limit: 25,
      });

      await controller.getControls('2', '25');

      expect(catalogService.getAllControls).toHaveBeenCalledWith(2, 25, undefined, undefined);
    });

    it('should filter by search term', async () => {
      mockCatalogService.getAllControls.mockResolvedValue({
        items: [mockControl],
        total: 1,
        page: 1,
        limit: 50,
      });

      await controller.getControls('1', '50', 'Access Control');

      expect(catalogService.getAllControls).toHaveBeenCalledWith(
        1,
        50,
        'Access Control',
        undefined,
      );
    });

    it('should filter by control family', async () => {
      mockCatalogService.getAllControls.mockResolvedValue({
        items: [mockControl],
        total: 1,
        page: 1,
        limit: 50,
      });

      await controller.getControls('1', '50', undefined, 'AC');

      expect(catalogService.getAllControls).toHaveBeenCalledWith(1, 50, undefined, 'AC');
    });

    it('should reject invalid pagination parameters', async () => {
      await expect(controller.getControls('0', '50')).rejects.toThrow(HttpException);
    });

    it('should reject limit exceeding maximum', async () => {
      await expect(controller.getControls('1', '101')).rejects.toThrow(HttpException);
    });
  });

});
