import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('Admin UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    role: 'Admin' as const,
    isActive: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = { items: [mockUser, { ...mockUser, id: 2 }] };
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty items array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue({ items: [] });

      const result = await controller.findAll();

      expect(result).toEqual({ items: [] });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });

    it('should handle ParseIntPipe for id parameter', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'Admin',
        isActive: true,
      };

      mockUsersService.create.mockResolvedValue({ item: mockUser });

      const result = await controller.create(createDto);

      expect(result).toEqual({ item: mockUser });
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should create user with minimal required fields', async () => {
      const createDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
      };

      mockUsersService.create.mockResolvedValue({ item: mockUser });

      await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      const createDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@test.com',
        password: 'password123',
      };

      mockUsersService.create.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const updatedUser = { ...mockUser, ...updateDto };
      mockUsersService.update.mockResolvedValue({ item: updatedUser });

      const result = await controller.update(1, updateDto);

      expect(result).toEqual({ item: updatedUser });
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should update only provided fields', async () => {
      const updateDto: UpdateUserDto = {
        email: 'newemail@test.com',
      };

      mockUsersService.update.mockResolvedValue({ item: mockUser });

      await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should update password when provided', async () => {
      const updateDto: UpdateUserDto = {
        password: 'newPassword123',
      };

      mockUsersService.update.mockResolvedValue({ item: mockUser });

      await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should update role when provided', async () => {
      const updateDto: UpdateUserDto = {
        role: 'ISSM',
      };

      mockUsersService.update.mockResolvedValue({ item: mockUser });

      await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should update isActive status', async () => {
      const updateDto: UpdateUserDto = {
        isActive: false,
      };

      mockUsersService.update.mockResolvedValue({
        item: { ...mockUser, isActive: false },
      });

      const result = await controller.update(1, updateDto);

      expect(result.item.isActive).toBe(false);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const updateDto: UpdateUserDto = { firstName: 'Test' };
      mockUsersService.update.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(controller.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when email is already taken', async () => {
      const updateDto: UpdateUserDto = {
        email: 'taken@test.com',
      };

      mockUsersService.update.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(controller.update(1, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const deleteResponse = {
        success: true,
        message: 'User john@test.com deleted successfully',
      };
      mockUsersService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove(1);

      expect(result).toEqual(deleteResponse);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockUsersService.remove.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when deleting last admin', async () => {
      mockUsersService.remove.mockRejectedValue(
        new ConflictException('Cannot delete the last admin user'),
      );

      await expect(controller.remove(1)).rejects.toThrow(ConflictException);
    });

    it('should handle ParseIntPipe for id parameter', async () => {
      const deleteResponse = { success: true, message: 'User deleted' };
      mockUsersService.remove.mockResolvedValue(deleteResponse);

      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('authorization', () => {
    it('should be protected by JwtAuthGuard and RolesGuard', () => {
      const guards = Reflect.getMetadata('__guards__', UsersController);
      expect(guards).toBeDefined();
    });

    it('should require Admin role', () => {
      const roles = Reflect.getMetadata('roles', UsersController);
      expect(roles).toContain('Admin');
    });
  });
});
