import { Test, TestingModule } from '@nestjs/testing';
import { StpsService } from './stps.service';

describe('StpsService', () => {
  let service: StpsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StpsService],
    }).compile();

    service = module.get<StpsService>(StpsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
