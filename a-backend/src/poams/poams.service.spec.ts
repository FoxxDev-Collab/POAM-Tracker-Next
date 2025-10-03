import { Test, TestingModule } from '@nestjs/testing';
import { PoamsService } from './poams.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  poam: {},
};

describe('PoamsService', () => {
  let service: PoamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoamsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PoamsService>(PoamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
