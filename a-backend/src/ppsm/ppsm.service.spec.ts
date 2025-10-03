import { Test, TestingModule } from '@nestjs/testing';
import { PpsmService } from './ppsm.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PpsmService', () => {
  let service: PpsmService;
  let prisma: PrismaService;

  const mockPpsmEntry = {
    id: 1,
    systemId: 1,
    port: '443',
    protocol: 'TCP',
    service: 'HTTPS',
    direction: 'Inbound',
    sourceIP: '0.0.0.0/0',
    destinationIP: '192.168.1.10',
    justification: 'Web application access',
    approvalStatus: 'Pending',
    riskAssessment: 'Low risk - standard HTTPS',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    systemPPSM: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PpsmService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PpsmService>(PpsmService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPackagePPSM', () => {
    it('should return PPSM entries for a package', async () => {
      const entriesWithSystem = [
        {
          ...mockPpsmEntry,
          system: {
            id: 1,
            name: 'Web Server',
            ipAddress: '192.168.1.10',
          },
        },
      ];

      mockPrismaService.systemPPSM.findMany.mockResolvedValue(entriesWithSystem);

      const result = await service.getPackagePPSM(1);

      expect(result).toHaveProperty('entries');
      expect(result.entries).toHaveLength(1);
      expect(result.entries[0]).toHaveProperty('port');
      expect(result.entries[0]).toHaveProperty('protocol');
      expect(result.entries[0]).toHaveProperty('service');
      expect(result.entries[0]).toHaveProperty('riskLevel');
      expect(prisma.systemPPSM.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            system: {
              packageId: 1,
            },
          }),
        }),
      );
    });

    it('should order entries by port', async () => {
      mockPrismaService.systemPPSM.findMany.mockResolvedValue([]);

      await service.getPackagePPSM(1);

      expect(prisma.systemPPSM.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { port: 'asc' },
        }),
      );
    });

    it('should include system information', async () => {
      mockPrismaService.systemPPSM.findMany.mockResolvedValue([]);

      await service.getPackagePPSM(1);

      expect(prisma.systemPPSM.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            system: expect.objectContaining({
              select: expect.objectContaining({
                id: true,
                name: true,
                ipAddress: true,
              }),
            }),
          }),
        }),
      );
    });
  });

  describe('getSystemPPSM', () => {
    it('should return PPSM entries for a system', async () => {
      mockPrismaService.systemPPSM.findMany.mockResolvedValue([mockPpsmEntry]);

      const result = await service.getSystemPPSM(1);

      expect(result).toHaveProperty('entries');
      expect(prisma.systemPPSM.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { systemId: 1 },
          orderBy: { port: 'asc' },
        }),
      );
    });

    it('should return empty array when no entries exist', async () => {
      mockPrismaService.systemPPSM.findMany.mockResolvedValue([]);

      const result = await service.getSystemPPSM(1);

      expect(result.entries).toEqual([]);
    });
  });

  describe('getPPSMById', () => {
    it('should return a PPSM entry by id', async () => {
      mockPrismaService.systemPPSM.findUnique.mockResolvedValue(mockPpsmEntry);

      const result = await service.getPPSMById(1);

      expect(result).toEqual(mockPpsmEntry);
      expect(prisma.systemPPSM.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
    });

    it('should return null when entry not found', async () => {
      mockPrismaService.systemPPSM.findUnique.mockResolvedValue(null);

      const result = await service.getPPSMById(999);

      expect(result).toBeNull();
    });
  });

  describe('createPPSM', () => {
    it('should create a new PPSM entry', async () => {
      const createData = {
        systemId: 1,
        port: 443,
        protocol: 'TCP',
        service: 'HTTPS',
        direction: 'Inbound',
        source: '0.0.0.0/0',
        destination: '192.168.1.10',
        justification: 'Web application access',
      };

      mockPrismaService.systemPPSM.create.mockResolvedValue(mockPpsmEntry);

      const result = await service.createPPSM(createData);

      expect(result).toEqual(mockPpsmEntry);
      expect(prisma.systemPPSM.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Object),
        }),
      );
    });
  });

  describe('updatePPSM', () => {
    it('should update a PPSM entry', async () => {
      const updateData = {
        justification: 'Updated justification',
        approvalStatus: 'Approved',
      };

      const updatedEntry = { ...mockPpsmEntry, ...updateData };
      mockPrismaService.systemPPSM.update.mockResolvedValue(updatedEntry);

      const result = await service.updatePPSM(1, updateData);

      expect(result).toEqual(updatedEntry);
      expect(prisma.systemPPSM.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.any(Object),
        }),
      );
    });
  });

  describe('deletePPSM', () => {
    it('should delete a PPSM entry', async () => {
      mockPrismaService.systemPPSM.delete.mockResolvedValue(mockPpsmEntry);

      const result = await service.deletePPSM(1);

      expect(result).toEqual(mockPpsmEntry);
      expect(prisma.systemPPSM.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('approvePPSM', () => {
    it('should approve a PPSM entry', async () => {
      const approvedEntry = { ...mockPpsmEntry, approvalStatus: 'Approved' };
      mockPrismaService.systemPPSM.update.mockResolvedValue(approvedEntry);

      const result = await service.approvePPSM(1);

      expect(result).toEqual(approvedEntry);
      expect(prisma.systemPPSM.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            approvalStatus: 'Approved',
          }),
        }),
      );
    });
  });

  describe('rejectPPSM', () => {
    it('should reject a PPSM entry with reason', async () => {
      const rejectedEntry = {
        ...mockPpsmEntry,
        approvalStatus: 'Rejected',
        rejectionReason: 'Security risk too high',
      };
      mockPrismaService.systemPPSM.update.mockResolvedValue(rejectedEntry);

      const result = await service.rejectPPSM(1, 'Security risk too high');

      expect(result).toEqual(rejectedEntry);
      expect(prisma.systemPPSM.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            approvalStatus: 'Rejected',
          }),
        }),
      );
    });

    it('should reject without reason', async () => {
      const rejectedEntry = { ...mockPpsmEntry, approvalStatus: 'Rejected' };
      mockPrismaService.systemPPSM.update.mockResolvedValue(rejectedEntry);

      await service.rejectPPSM(1);

      expect(prisma.systemPPSM.update).toHaveBeenCalled();
    });
  });
});
