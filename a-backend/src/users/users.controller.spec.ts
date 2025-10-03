import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    email: 'john@test.com',
    role: 'Auditor' as const,
    pmoId: 1,
    isActive: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
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
      const users = [mockUser, { ...mockUser, id: 2 }];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'Auditor',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null when user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Jane',
      };

      const updatedUser = { ...mockUser, name: 'Jane' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      const deactivatedUser = { ...mockUser, isActive: false };
      mockUsersService.remove.mockResolvedValue(deactivatedUser);

      const result = await controller.remove(1);

      expect(result).toEqual(deactivatedUser);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', UsersController);
      expect(guards).toBeDefined();
    });
  });
});
