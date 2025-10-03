import { Test, TestingModule } from '@nestjs/testing';
import { SystemsController } from './systems.controller';
import { SystemsService } from './systems.service';

describe('SystemsController', () => {
  let controller: SystemsController;
  let service: SystemsService;

  const mockSystem = {
    id: 1,
    packageId: 1,
    groupId: 1,
    name: 'Production Web Server',
    hostname: 'web-prod-01',
    ipAddress: '192.168.1.10',
    operatingSystem: 'RHEL 8',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSystemsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPackage: jest.fn(),
    findByGroup: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStigFindings: jest.fn(),
    getStigScans: jest.fn(),
    uploadStigFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemsController],
      providers: [
        {
          provide: SystemsService,
          useValue: mockSystemsService,
        },
      ],
    }).compile();

    controller = module.get<SystemsController>(SystemsController);
    service = module.get<SystemsService>(SystemsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a system', async () => {
      const createDto = {
        packageId: 1,
        groupId: 1,
        name: 'Test System',
        hostname: 'test-01',
      };

      mockSystemsService.create.mockResolvedValue({ item: mockSystem });

      const result = await controller.create(createDto);

      expect(result).toEqual({ item: mockSystem });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all systems when no query params', async () => {
      const systems = { items: [mockSystem] };
      mockSystemsService.findAll.mockResolvedValue(systems);

      const result = await controller.findAll();

      expect(result).toEqual(systems);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should filter by packageId when provided', async () => {
      const systems = { items: [mockSystem] };
      mockSystemsService.findByPackage.mockResolvedValue(systems);

      const result = await controller.findAll('1');

      expect(result).toEqual(systems);
      expect(service.findByPackage).toHaveBeenCalledWith(1);
    });

    it('should filter by groupId when provided', async () => {
      const systems = { items: [mockSystem] };
      mockSystemsService.findByGroup.mockResolvedValue(systems);

      const result = await controller.findAll(undefined, '1');

      expect(result).toEqual(systems);
      expect(service.findByGroup).toHaveBeenCalledWith(1);
    });
  });

  describe('findByPackageId', () => {
    it('should return systems for a package', async () => {
      const systems = { items: [mockSystem] };
      mockSystemsService.findByPackage.mockResolvedValue(systems);

      const result = await controller.findByPackageId(1);

      expect(result).toEqual(systems);
      expect(service.findByPackage).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should return a system by id', async () => {
      mockSystemsService.findOne.mockResolvedValue(mockSystem);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockSystem);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a system', async () => {
      const updateDto = { name: 'Updated System' };
      const updatedSystem = { ...mockSystem, name: 'Updated System' };
      mockSystemsService.update.mockResolvedValue(updatedSystem);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(updatedSystem);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a system', async () => {
      mockSystemsService.remove.mockResolvedValue(mockSystem);

      const result = await controller.remove(1);

      expect(result).toEqual(mockSystem);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('getStigFindings', () => {
    it('should return STIG findings for a system', async () => {
      const findings = [{ id: 1, severity: 'High' }];
      mockSystemsService.getStigFindings.mockResolvedValue(findings);

      const result = await controller.getStigFindings(1);

      expect(result).toEqual(findings);
      expect(service.getStigFindings).toHaveBeenCalledWith(1);
    });
  });

  describe('getStigScans', () => {
    it('should return STIG scans for a system', async () => {
      const scans = [{ id: 1, scanDate: new Date() }];
      mockSystemsService.getStigScans.mockResolvedValue(scans);

      const result = await controller.getStigScans(1);

      expect(result).toEqual(scans);
      expect(service.getStigScans).toHaveBeenCalledWith(1);
    });
  });

  describe('uploadStigFile', () => {
    it('should upload a STIG file', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'stig-results.xml',
        encoding: '7bit',
        mimetype: 'text/xml',
        size: 2048,
        buffer: Buffer.from('<xml></xml>'),
        filename: 'stig-results.xml',
        path: '/tmp/stig-results.xml',
        destination: '/tmp',
        stream: null as any,
      };

      const uploadResult = { success: true, findings: 50 };
      mockSystemsService.uploadStigFile.mockResolvedValue(uploadResult);

      const result = await controller.uploadStigFile(1, mockFile);

      expect(result).toEqual(uploadResult);
      expect(service.uploadStigFile).toHaveBeenCalledWith(1, mockFile);
    });
  });

  describe('guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', SystemsController);
      expect(guards).toBeDefined();
    });
  });
});
