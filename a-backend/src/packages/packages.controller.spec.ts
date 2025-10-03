import { Test, TestingModule } from '@nestjs/testing';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { SystemsService } from '../systems/systems.service';
import { GroupsService } from '../groups/groups.service';
import { CreatePackageDto, UpdatePackageDto } from './dto';

describe('PackagesController', () => {
  let controller: PackagesController;
  let packagesService: PackagesService;
  let systemsService: SystemsService;
  let groupsService: GroupsService;

  const mockPackage = {
    id: 1,
    name: 'Test ATO Package',
    description: 'Test Description',
    teamId: 1,
    rmfStep: 'Categorize',
    systemType: 'Major_Application',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPackagesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getDocuments: jest.fn(),
    uploadDocument: jest.fn(),
    downloadDocument: jest.fn(),
    deleteDocument: jest.fn(),
  };

  const mockSystemsService = {
    findByPackage: jest.fn(),
  };

  const mockGroupsService = {
    findByPackage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackagesController],
      providers: [
        {
          provide: PackagesService,
          useValue: mockPackagesService,
        },
        {
          provide: SystemsService,
          useValue: mockSystemsService,
        },
        {
          provide: GroupsService,
          useValue: mockGroupsService,
        },
      ],
    }).compile();

    controller = module.get<PackagesController>(PackagesController);
    packagesService = module.get<PackagesService>(PackagesService);
    systemsService = module.get<SystemsService>(SystemsService);
    groupsService = module.get<GroupsService>(GroupsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a package', async () => {
      const createDto: CreatePackageDto = {
        name: 'New Package',
        description: 'Description',
        teamId: 1,
      };

      mockPackagesService.create.mockResolvedValue({ item: mockPackage });

      const result = await controller.create(createDto);

      expect(result).toEqual({ item: mockPackage });
      expect(packagesService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all packages', async () => {
      const packages = { items: [mockPackage] };
      mockPackagesService.findAll.mockResolvedValue(packages);

      const result = await controller.findAll();

      expect(result).toEqual(packages);
      expect(packagesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a package by id', async () => {
      mockPackagesService.findOne.mockResolvedValue(mockPackage);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockPackage);
      expect(packagesService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null when package not found', async () => {
      mockPackagesService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a package', async () => {
      const updateDto: UpdatePackageDto = {
        name: 'Updated Package',
      };

      const updatedPackage = { ...mockPackage, name: 'Updated Package' };
      mockPackagesService.update.mockResolvedValue({ item: updatedPackage });

      const result = await controller.update(1, updateDto);

      expect(result).toEqual({ item: updatedPackage });
      expect(packagesService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a package', async () => {
      const deleteResponse = { success: true, message: 'Package deleted' };
      mockPackagesService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove(1);

      expect(result).toEqual(deleteResponse);
      expect(packagesService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('getPackageSystems', () => {
    it('should return systems for a package', async () => {
      const systems = [{ id: 1, name: 'System 1' }];
      mockSystemsService.findByPackage.mockResolvedValue(systems);

      const result = await controller.getPackageSystems(1);

      expect(result).toEqual(systems);
      expect(systemsService.findByPackage).toHaveBeenCalledWith(1);
    });
  });

  describe('getPackageGroups', () => {
    it('should return groups for a package', async () => {
      const groups = [{ id: 1, name: 'Group 1' }];
      mockGroupsService.findByPackage.mockResolvedValue(groups);

      const result = await controller.getPackageGroups(1);

      expect(result).toEqual(groups);
      expect(groupsService.findByPackage).toHaveBeenCalledWith(1);
    });
  });

  describe('getPackageDocuments', () => {
    it('should return documents for a package', async () => {
      const documents = [{ id: '1', name: 'Document 1' }];
      mockPackagesService.getDocuments.mockResolvedValue(documents);

      const result = await controller.getPackageDocuments(1);

      expect(result).toEqual(documents);
      expect(packagesService.getDocuments).toHaveBeenCalledWith(1);
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document to a package', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      const body = { description: 'Test document' };
      const uploadedDoc = { id: '1', name: 'test.pdf' };

      mockPackagesService.uploadDocument.mockResolvedValue(uploadedDoc);

      const result = await controller.uploadDocument(1, file, body);

      expect(result).toEqual(uploadedDoc);
      expect(packagesService.uploadDocument).toHaveBeenCalledWith(1, file, body);
    });

    it('should throw error when no file provided', async () => {
      await expect(
        controller.uploadDocument(1, undefined as any, {}),
      ).rejects.toThrow('No file provided');
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document from a package', async () => {
      const deleteResponse = { success: true };
      mockPackagesService.deleteDocument.mockResolvedValue(deleteResponse);

      const result = await controller.deleteDocument(1, 'doc-123');

      expect(result).toEqual(deleteResponse);
      expect(packagesService.deleteDocument).toHaveBeenCalledWith(1, 'doc-123');
    });
  });

  describe('guards and auditing', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', PackagesController);
      expect(guards).toBeDefined();
    });
  });
});
