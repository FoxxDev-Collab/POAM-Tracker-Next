import { Test, TestingModule } from '@nestjs/testing';
import { PoamsController } from './poams.controller';

describe('PoamsController', () => {
  let controller: PoamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoamsController],
    }).compile();

    controller = module.get<PoamsController>(PoamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
