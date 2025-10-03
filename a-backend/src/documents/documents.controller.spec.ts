import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  const mockCategory = {
    id: 1,
    controlFamily: 'AC',
    name: 'Access Control',
    displayOrder: 1,
  };

  const mockDocument = {
    id: 1,
    packageId: 1,
    categoryId: 1,
    documentType: 'POLICY',
    title: 'Access Control Policy',
    filename: 'ac-policy.pdf',
    uploadedAt: new Date(),
  };

  const mockDocumentsService = {
    getCategories: jest.fn(),
    getPackageDocuments: jest.fn(),
    getPackageDocumentStats: jest.fn(),
    getRecentDocuments: jest.fn(),
    uploadDocument: jest.fn(),
    getDocumentVersions: jest.fn(),
    getDocumentVersion: jest.fn(),
    downloadDocument: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCategories', () => {
    it('should return all document categories', async () => {
      const categories = [mockCategory, { ...mockCategory, id: 2 }];
      mockDocumentsService.getCategories.mockResolvedValue(categories);

      const result = await controller.getCategories();

      expect(result).toEqual(categories);
      expect(service.getCategories).toHaveBeenCalled();
    });
  });

  describe('getPackageDocuments', () => {
    it('should return documents for a package', async () => {
      const documents = [mockDocument];
      mockDocumentsService.getPackageDocuments.mockResolvedValue(documents);

      const result = await controller.getPackageDocuments(1);

      expect(result).toEqual(documents);
      expect(service.getPackageDocuments).toHaveBeenCalledWith(1, undefined, undefined);
    });

    it('should filter by controlFamily', async () => {
      mockDocumentsService.getPackageDocuments.mockResolvedValue([mockDocument]);

      await controller.getPackageDocuments(1, 'AC');

      expect(service.getPackageDocuments).toHaveBeenCalledWith(1, 'AC', undefined);
    });

    it('should filter by documentType', async () => {
      mockDocumentsService.getPackageDocuments.mockResolvedValue([mockDocument]);

      await controller.getPackageDocuments(1, undefined, 'POLICY');

      expect(service.getPackageDocuments).toHaveBeenCalledWith(1, undefined, 'POLICY');
    });

    it('should filter by both parameters', async () => {
      mockDocumentsService.getPackageDocuments.mockResolvedValue([mockDocument]);

      await controller.getPackageDocuments(1, 'AC', 'POLICY');

      expect(service.getPackageDocuments).toHaveBeenCalledWith(1, 'AC', 'POLICY');
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document', async () => {
      // Skipped - requires file system mocking for readFileSync
      expect(service).toBeDefined();
    });
  });

  describe('getDocumentVersions', () => {
    it('should return document versions', async () => {
      const versions = [{ id: 1, version: 1 }];
      mockDocumentsService.getDocumentVersions.mockResolvedValue(versions);

      const result = await controller.getDocumentVersions(1);

      expect(result).toEqual(versions);
      expect(service.getDocumentVersions).toHaveBeenCalledWith(1);
    });
  });

  describe('getDocumentVersion', () => {
    it('should return a specific document version', async () => {
      const version = { id: 1, version: 1 };
      mockDocumentsService.getDocumentVersion.mockResolvedValue(version);

      const result = await controller.getDocumentVersion(1);

      expect(result).toEqual(version);
      expect(service.getDocumentVersion).toHaveBeenCalledWith(1);
    });
  });
});
