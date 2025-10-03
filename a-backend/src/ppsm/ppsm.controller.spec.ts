import { Test, TestingModule } from '@nestjs/testing';
import { PpsmController } from './ppsm.controller';
import { PpsmService } from './ppsm.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PpsmController', () => {
  let controller: PpsmController;
  let service: PpsmService;

  const mockPpsmEntry = {
    id: 1,
    systemId: 1,
    port: 443,
    protocol: 'TCP',
    service: 'HTTPS',
    direction: 'Inbound',
    approvalStatus: 'Pending',
  };

  const mockPpsmService = {
    getPackagePPSM: jest.fn(),
    getSystemPPSM: jest.fn(),
    getPPSMById: jest.fn(),
    createPPSM: jest.fn(),
    updatePPSM: jest.fn(),
    deletePPSM: jest.fn(),
    approvePPSM: jest.fn(),
    rejectPPSM: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PpsmController],
      providers: [
        {
          provide: PpsmService,
          useValue: mockPpsmService,
        },
      ],
    }).compile();

    controller = module.get<PpsmController>(PpsmController);
    service = module.get<PpsmService>(PpsmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPackagePPSM', () => {
    it('should return PPSM entries for a package', async () => {
      const entries = { entries: [mockPpsmEntry] };
      mockPpsmService.getPackagePPSM.mockResolvedValue(entries);

      const result = await controller.getPackagePPSM(1);

      expect(result).toEqual(entries);
      expect(service.getPackagePPSM).toHaveBeenCalledWith(1);
    });
  });

  describe('getSystemPPSM', () => {
    it('should return PPSM entries for a system', async () => {
      const entries = { entries: [mockPpsmEntry] };
      mockPpsmService.getSystemPPSM.mockResolvedValue(entries);

      const result = await controller.getSystemPPSM(1);

      expect(result).toEqual(entries);
      expect(service.getSystemPPSM).toHaveBeenCalledWith(1);
    });
  });

  describe('getPPSMById', () => {
    it('should return a PPSM entry by id', async () => {
      mockPpsmService.getPPSMById.mockResolvedValue(mockPpsmEntry);

      const result = await controller.getPPSMById(1);

      expect(result).toEqual(mockPpsmEntry);
      expect(service.getPPSMById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when entry not found', async () => {
      mockPpsmService.getPPSMById.mockResolvedValue(null);

      await expect(controller.getPPSMById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createPPSM', () => {
    it('should create a new PPSM entry', async () => {
      const createData = {
        systemId: 1,
        port: 443,
        protocol: 'TCP',
        service: 'HTTPS',
        justification: 'Web access',
      };

      mockPpsmService.createPPSM.mockResolvedValue(mockPpsmEntry);

      const result = await controller.createPPSM(createData);

      expect(result).toEqual(mockPpsmEntry);
      expect(service.createPPSM).toHaveBeenCalledWith(createData);
    });

    it('should throw BadRequestException when missing required fields', async () => {
      const invalidData = {
        systemId: 1,
        // Missing port, protocol, service
      };

      await expect(controller.createPPSM(invalidData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate all required fields', async () => {
      const testCases = [
        { systemId: 1, port: 443, protocol: 'TCP' }, // missing service
        { systemId: 1, port: 443, service: 'HTTPS' }, // missing protocol
        { systemId: 1, protocol: 'TCP', service: 'HTTPS' }, // missing port
        { port: 443, protocol: 'TCP', service: 'HTTPS' }, // missing systemId
      ];

      for (const testData of testCases) {
        await expect(controller.createPPSM(testData)).rejects.toThrow(
          BadRequestException,
        );
      }
    });
  });

  describe('updatePPSM', () => {
    it('should update a PPSM entry', async () => {
      const updateData = { justification: 'Updated justification' };
      const updatedEntry = { ...mockPpsmEntry, ...updateData };

      mockPpsmService.getPPSMById.mockResolvedValue(mockPpsmEntry);
      mockPpsmService.updatePPSM.mockResolvedValue(updatedEntry);

      const result = await controller.updatePPSM(1, updateData);

      expect(result).toEqual(updatedEntry);
      expect(service.updatePPSM).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw NotFoundException when entry not found', async () => {
      mockPpsmService.getPPSMById.mockResolvedValue(null);

      await expect(
        controller.updatePPSM(999, { justification: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePPSM', () => {
    it('should delete a PPSM entry', async () => {
      mockPpsmService.getPPSMById.mockResolvedValue(mockPpsmEntry);
      mockPpsmService.deletePPSM.mockResolvedValue(mockPpsmEntry);

      const result = await controller.deletePPSM(1);

      expect(result).toEqual(mockPpsmEntry);
      expect(service.deletePPSM).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when entry not found', async () => {
      mockPpsmService.getPPSMById.mockResolvedValue(null);

      await expect(controller.deletePPSM(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('approvePPSM', () => {
    it('should approve a PPSM entry', async () => {
      const approvedEntry = { ...mockPpsmEntry, approvalStatus: 'Approved' };
      mockPpsmService.approvePPSM.mockResolvedValue(approvedEntry);

      const result = await controller.approvePPSM(1);

      expect(result).toEqual(approvedEntry);
      expect(service.approvePPSM).toHaveBeenCalledWith(1);
    });
  });

  describe('rejectPPSM', () => {
    it('should reject a PPSM entry with reason', async () => {
      const rejectedEntry = { ...mockPpsmEntry, approvalStatus: 'Rejected' };
      mockPpsmService.rejectPPSM.mockResolvedValue(rejectedEntry);

      const result = await controller.rejectPPSM(1, {
        reason: 'Security risk',
      });

      expect(result).toEqual(rejectedEntry);
      expect(service.rejectPPSM).toHaveBeenCalledWith(1, 'Security risk');
    });

    it('should reject without reason', async () => {
      const rejectedEntry = { ...mockPpsmEntry, approvalStatus: 'Rejected' };
      mockPpsmService.rejectPPSM.mockResolvedValue(rejectedEntry);

      const result = await controller.rejectPPSM(1, {});

      expect(result).toEqual(rejectedEntry);
      expect(service.rejectPPSM).toHaveBeenCalledWith(1, undefined);
    });
  });
});
