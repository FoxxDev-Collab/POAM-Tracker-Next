import { Test, TestingModule } from '@nestjs/testing';
import { StpsService } from './stps.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  stp: {},
};

describe('StpsService', () => {
  let service: StpsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StpsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StpsService>(StpsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
