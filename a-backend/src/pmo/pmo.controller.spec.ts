import { Test, TestingModule } from '@nestjs/testing';
import { PmoController } from './pmo.controller';
import { PmoService } from './pmo.service';
import { CreatePmoDto, UpdatePmoDto } from './dto';
import { NotFoundException } from '@nestjs/common';

describe('PmoController', () => {
  let controller: PmoController;
  let service: PmoService;

  const mockPmo = {
    id: 1,
    name: 'Test PMO',
    description: 'Test Description',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        role: 'Admin' as const,
        isActive: true,
      },
    ],
  };

  const mockPmoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getUsersInPmo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PmoController],
      providers: [
        {
          provide: PmoService,
          useValue: mockPmoService,
        },
      ],
    }).compile();

    controller = module.get<PmoController>(PmoController);
    service = module.get<PmoService>(PmoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new PMO', async () => {
      const createDto: CreatePmoDto = {
        name: 'Test PMO',
        description: 'Test Description',
        isActive: true,
      };

      mockPmoService.create.mockResolvedValue(mockPmo);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockPmo);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should create PMO without optional fields', async () => {
      const createDto: CreatePmoDto = {
        name: 'Minimal PMO',
      };

      const minimalPmo = { ...mockPmo, name: 'Minimal PMO', description: null };
      mockPmoService.create.mockResolvedValue(minimalPmo);

      const result = await controller.create(createDto);

      expect(result).toEqual(minimalPmo);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of PMOs', async () => {
      const pmos = [mockPmo, { ...mockPmo, id: 2, name: 'PMO 2' }];
      mockPmoService.findAll.mockResolvedValue(pmos);

      const result = await controller.findAll();

      expect(result).toEqual(pmos);
      expect(result).toHaveLength(2);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no PMOs exist', async () => {
      mockPmoService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a PMO by id', async () => {
      mockPmoService.findOne.mockResolvedValue(mockPmo);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockPmo);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException for non-existent PMO', async () => {
      mockPmoService.findOne.mockRejectedValue(
        new NotFoundException('PMO with ID 999 not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });

    it('should handle various id types', async () => {
      mockPmoService.findOne.mockResolvedValue(mockPmo);

      await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);

      await controller.findOne(100);
      expect(service.findOne).toHaveBeenCalledWith(100);
    });
  });

  describe('getUsersInPmo', () => {
    it('should return users in a PMO', async () => {
      mockPmoService.getUsersInPmo.mockResolvedValue(mockPmo.users);

      const result = await controller.getUsersInPmo(1);

      expect(result).toEqual(mockPmo.users);
      expect(result).toHaveLength(1);
      expect(service.getUsersInPmo).toHaveBeenCalledWith(1);
    });

    it('should return empty array when PMO has no users', async () => {
      mockPmoService.getUsersInPmo.mockResolvedValue([]);

      const result = await controller.getUsersInPmo(1);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw NotFoundException for non-existent PMO', async () => {
      mockPmoService.getUsersInPmo.mockRejectedValue(
        new NotFoundException('PMO with ID 999 not found'),
      );

      await expect(controller.getUsersInPmo(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a PMO', async () => {
      const updateDto: UpdatePmoDto = {
        name: 'Updated PMO',
        description: 'Updated Description',
      };

      const updatedPmo = { ...mockPmo, ...updateDto };
      mockPmoService.update.mockResolvedValue(updatedPmo);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(updatedPmo);
      expect(result.name).toBe('Updated PMO');
      expect(result.description).toBe('Updated Description');
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should update only name', async () => {
      const updateDto: UpdatePmoDto = {
        name: 'Only Name Updated',
      };

      const updatedPmo = { ...mockPmo, name: 'Only Name Updated' };
      mockPmoService.update.mockResolvedValue(updatedPmo);

      const result = await controller.update(1, updateDto);

      expect(result.name).toBe('Only Name Updated');
      expect(result.description).toBe(mockPmo.description);
    });

    it('should update only description', async () => {
      const updateDto: UpdatePmoDto = {
        description: 'Only Description Updated',
      };

      const updatedPmo = { ...mockPmo, description: 'Only Description Updated' };
      mockPmoService.update.mockResolvedValue(updatedPmo);

      const result = await controller.update(1, updateDto);

      expect(result.description).toBe('Only Description Updated');
      expect(result.name).toBe(mockPmo.name);
    });

    it('should update isActive status', async () => {
      const updateDto: UpdatePmoDto = {
        isActive: false,
      };

      const updatedPmo = { ...mockPmo, isActive: false };
      mockPmoService.update.mockResolvedValue(updatedPmo);

      const result = await controller.update(1, updateDto);

      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException for non-existent PMO', async () => {
      const updateDto: UpdatePmoDto = { name: 'Test' };
      mockPmoService.update.mockRejectedValue(
        new NotFoundException('PMO with ID 999 not found'),
      );

      await expect(controller.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a PMO', async () => {
      const deactivatedPmo = { ...mockPmo, isActive: false };
      mockPmoService.remove.mockResolvedValue(deactivatedPmo);

      const result = await controller.remove(1);

      expect(result).toEqual(deactivatedPmo);
      expect(result.isActive).toBe(false);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException for non-existent PMO', async () => {
      mockPmoService.remove.mockRejectedValue(
        new NotFoundException('PMO with ID 999 not found'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(999);
    });

    it('should preserve PMO data except isActive flag', async () => {
      const deactivatedPmo = { ...mockPmo, isActive: false };
      mockPmoService.remove.mockResolvedValue(deactivatedPmo);

      const result = await controller.remove(1);

      expect(result.id).toBe(mockPmo.id);
      expect(result.name).toBe(mockPmo.name);
      expect(result.description).toBe(mockPmo.description);
      expect(result.users).toEqual(mockPmo.users);
      expect(result.isActive).toBe(false);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle service throwing unexpected errors', async () => {
      mockPmoService.findOne.mockRejectedValue(new Error('Database error'));

      await expect(controller.findOne(1)).rejects.toThrow('Database error');
    });

    it('should pass through all service errors', async () => {
      const customError = new Error('Custom service error');
      mockPmoService.create.mockRejectedValue(customError);

      await expect(
        controller.create({ name: 'Test' }),
      ).rejects.toThrow('Custom service error');
    });
  });
});
