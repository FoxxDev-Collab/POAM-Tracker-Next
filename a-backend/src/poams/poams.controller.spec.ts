import { Test, TestingModule } from '@nestjs/testing';
import { PoamsController } from './poams.controller';
import { PoamsService } from './poams.service';

const mockPoamsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('PoamsController', () => {
  let controller: PoamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoamsController],
      providers: [
        {
          provide: PoamsService,
          useValue: mockPoamsService,
        },
      ],
    }).compile();

    controller = module.get<PoamsController>(PoamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
