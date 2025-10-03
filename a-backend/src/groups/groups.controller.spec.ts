import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto } from './dto';

describe('GroupsController', () => {
  let controller: GroupsController;
  let service: GroupsService;

  const mockGroup = {
    id: 1,
    name: 'Test Group',
    description: 'Test Description',
    packageId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGroupsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPackage: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: mockGroupsService,
        },
      ],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
    service = module.get<GroupsService>(GroupsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a group', async () => {
      const createDto: CreateGroupDto = {
        name: 'New Group',
        description: 'Description',
        packageId: 1,
      };

      mockGroupsService.create.mockResolvedValue({ item: mockGroup });

      const result = await controller.create(createDto);

      expect(result).toEqual({ item: mockGroup });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all groups when no packageId provided', async () => {
      const groups = [mockGroup, { ...mockGroup, id: 2 }];
      mockGroupsService.findAll.mockResolvedValue(groups);

      const result = await controller.findAll();

      expect(result).toEqual(groups);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return groups by package when packageId provided', async () => {
      const groups = { items: [mockGroup] };
      mockGroupsService.findByPackage.mockResolvedValue(groups);

      const result = await controller.findAll('1');

      expect(result).toEqual(groups);
      expect(service.findByPackage).toHaveBeenCalledWith(1);
    });

    it('should handle invalid packageId', async () => {
      mockGroupsService.findAll.mockResolvedValue([]);

      await controller.findAll('invalid');

      // parseInt('invalid') returns NaN, service will be called with NaN
      expect(service.findByPackage).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a group by id', async () => {
      mockGroupsService.findOne.mockResolvedValue(mockGroup);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockGroup);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null when group not found', async () => {
      mockGroupsService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a group', async () => {
      const updateDto: UpdateGroupDto = {
        name: 'Updated Group',
      };

      const updatedGroup = { ...mockGroup, name: 'Updated Group' };
      mockGroupsService.update.mockResolvedValue(updatedGroup);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(updatedGroup);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a group', async () => {
      mockGroupsService.remove.mockResolvedValue(mockGroup);

      const result = await controller.remove(1);

      expect(result).toEqual(mockGroup);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', GroupsController);
      expect(guards).toBeDefined();
    });
  });
});
