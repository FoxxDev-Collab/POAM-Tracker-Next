import { Test, TestingModule } from '@nestjs/testing';
import { VulnerabilitiesController } from './vulnerabilities.controller';

describe('VulnerabilitiesController', () => {
  let controller: VulnerabilitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VulnerabilitiesController],
    }).compile();

    controller = module.get<VulnerabilitiesController>(VulnerabilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
