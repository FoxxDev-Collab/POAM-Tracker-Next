import { Test, TestingModule } from '@nestjs/testing';
import { StpsController } from './stps.controller';
import { StpsService } from './stps.service';

const mockStpsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('StpsController', () => {
  let controller: StpsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StpsController],
      providers: [
        {
          provide: StpsService,
          useValue: mockStpsService,
        },
      ],
    }).compile();

    controller = module.get<StpsController>(StpsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
