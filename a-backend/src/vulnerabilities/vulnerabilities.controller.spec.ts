import { Test, TestingModule } from '@nestjs/testing';
import { VulnerabilitiesController } from './vulnerabilities.controller';
import { VulnerabilitiesService } from './vulnerabilities.service';

const mockVulnerabilitiesService = {
  importNessusFile: jest.fn(),
  importStigFile: jest.fn(),
  findAll: jest.fn(),
  findBySystem: jest.fn(),
  findByGroup: jest.fn(),
  findNessusReports: jest.fn(),
  getVulnerabilityStats: jest.fn(),
  getNessusReports: jest.fn(),
  getStigFindings: jest.fn(),
};

describe('VulnerabilitiesController', () => {
  let controller: VulnerabilitiesController;
  let service: VulnerabilitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VulnerabilitiesController],
      providers: [
        {
          provide: VulnerabilitiesService,
          useValue: mockVulnerabilitiesService,
        },
      ],
    }).compile();

    controller = module.get<VulnerabilitiesController>(
      VulnerabilitiesController,
    );
    service = module.get<VulnerabilitiesService>(VulnerabilitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all vulnerabilities', async () => {
      const vulnerabilities = [{ id: 1 }, { id: 2 }];
      mockVulnerabilitiesService.findAll.mockResolvedValue(vulnerabilities);

      const result = await controller.findAll();

      expect(result).toEqual(vulnerabilities);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should filter by severity', async () => {
      const vulnerabilities = [{ id: 1, severity: 'Critical' }];
      mockVulnerabilitiesService.findAll.mockResolvedValue(vulnerabilities);

      await controller.findAll('Critical');

      expect(service.findAll).toHaveBeenCalledWith({
        severity: 'Critical',
        status: undefined,
        systemId: undefined,
        groupId: undefined,
      });
    });

    it('should filter by status', async () => {
      await controller.findAll(undefined, 'Open');

      expect(service.findAll).toHaveBeenCalledWith({
        severity: undefined,
        status: 'Open',
        systemId: undefined,
        groupId: undefined,
      });
    });

    it('should filter by systemId', async () => {
      await controller.findAll(undefined, undefined, '123');

      expect(service.findAll).toHaveBeenCalledWith({
        severity: undefined,
        status: undefined,
        systemId: 123,
        groupId: undefined,
      });
    });

    it('should filter by groupId', async () => {
      await controller.findAll(undefined, undefined, undefined, '456');

      expect(service.findAll).toHaveBeenCalledWith({
        severity: undefined,
        status: undefined,
        systemId: undefined,
        groupId: 456,
      });
    });
  });

  describe('findBySystemsQuery', () => {
    it('should find by system when systemId provided', async () => {
      const vulnerabilities = [{ id: 1, systemId: 123 }];
      mockVulnerabilitiesService.findBySystem.mockResolvedValue(vulnerabilities);

      const result = await controller.findBySystemsQuery('123');

      expect(result).toEqual(vulnerabilities);
      expect(service.findBySystem).toHaveBeenCalledWith(123);
    });

    it('should find by group when groupId provided', async () => {
      const vulnerabilities = [{ id: 1, groupId: 456 }];
      mockVulnerabilitiesService.findByGroup.mockResolvedValue(vulnerabilities);

      const result = await controller.findBySystemsQuery(undefined, '456');

      expect(result).toEqual(vulnerabilities);
      expect(service.findByGroup).toHaveBeenCalledWith(456);
    });

    it('should find all when no filters provided', async () => {
      const vulnerabilities = [{ id: 1 }, { id: 2 }];
      mockVulnerabilitiesService.findAll.mockResolvedValue(vulnerabilities);

      const result = await controller.findBySystemsQuery();

      expect(result).toEqual(vulnerabilities);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getNessusReports', () => {
    it('should get Nessus reports with packageId', async () => {
      const reports = [{ id: 1, packageId: 100 }];
      mockVulnerabilitiesService.findNessusReports.mockResolvedValue(reports);

      const result = await controller.getNessusReports({ package_id: '100' });

      expect(result).toEqual(reports);
      expect(service.findNessusReports).toHaveBeenCalledWith({
        packageId: 100,
        systemId: undefined,
      });
    });

    it('should get Nessus reports with systemId', async () => {
      const reports = [{ id: 1, systemId: 200 }];
      mockVulnerabilitiesService.findNessusReports.mockResolvedValue(reports);

      const result = await controller.getNessusReports({ system_id: '200' });

      expect(result).toEqual(reports);
      expect(service.findNessusReports).toHaveBeenCalledWith({
        packageId: undefined,
        systemId: 200,
      });
    });

    it('should handle invalid packageId', async () => {
      mockVulnerabilitiesService.findNessusReports.mockResolvedValue([]);

      await controller.getNessusReports({ package_id: 'invalid' });

      expect(service.findNessusReports).toHaveBeenCalledWith({
        packageId: undefined,
        systemId: undefined,
      });
    });
  });

  describe('guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', VulnerabilitiesController);
      expect(guards).toBeDefined();
    });
  });
});
