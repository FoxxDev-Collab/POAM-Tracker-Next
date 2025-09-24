import { Test, TestingModule } from '@nestjs/testing';
import { StpsController } from './stps.controller';

describe('StpsController', () => {
  let controller: StpsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StpsController],
    }).compile();

    controller = module.get<StpsController>(StpsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
