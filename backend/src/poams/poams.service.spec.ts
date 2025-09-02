import { Test, TestingModule } from '@nestjs/testing';
import { PoamsService } from './poams.service';

describe('PoamsService', () => {
  let service: PoamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoamsService],
    }).compile();

    service = module.get<PoamsService>(PoamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
