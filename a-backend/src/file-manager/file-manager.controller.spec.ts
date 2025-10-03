import { Test, TestingModule } from '@nestjs/testing';
import { FileManagerController } from './file-manager.controller';
import { FileManagerService } from './file-manager.service';

describe('FileManagerController', () => {
  let controller: FileManagerController;
  let service: FileManagerService;

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('test'),
    filename: 'test-123.pdf',
    path: '/tmp/test-123.pdf',
    destination: '/tmp',
    stream: null as any,
  };

  const mockFileRecord = {
    id: 1,
    filename: 'test-123.pdf',
    originalFilename: 'test.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
    filePath: '/uploads/test-123.pdf',
    uploadedAt: new Date(),
  };

  const mockFileManagerService = {
    uploadFile: jest.fn(),
    getAllFiles: jest.fn(),
    getFileById: jest.fn(),
    updateFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileManagerController],
      providers: [
        {
          provide: FileManagerService,
          useValue: mockFileManagerService,
        },
      ],
    }).compile();

    controller = module.get<FileManagerController>(FileManagerController);
    service = module.get<FileManagerService>(FileManagerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a file', async () => {
      const body = { description: 'Test file' };
      mockFileManagerService.uploadFile.mockResolvedValue(mockFileRecord);

      const result = await controller.uploadFile(mockFile, body);

      expect(result).toEqual(mockFileRecord);
      expect(service.uploadFile).toHaveBeenCalledWith(mockFile, body);
    });
  });

  describe('getAllFiles', () => {
    it('should return all files', async () => {
      const files = [mockFileRecord, { ...mockFileRecord, id: 2 }];
      mockFileManagerService.getAllFiles.mockResolvedValue(files);

      const result = await controller.getAllFiles();

      expect(result).toEqual(files);
      expect(service.getAllFiles).toHaveBeenCalled();
    });
  });

  describe('getFileById', () => {
    it('should return a file by id', async () => {
      mockFileManagerService.getFileById.mockResolvedValue(mockFileRecord);

      const result = await controller.getFileById('1');

      expect(result).toEqual(mockFileRecord);
      expect(service.getFileById).toHaveBeenCalledWith('1');
    });
  });

  describe('updateFile', () => {
    it('should update a file', async () => {
      const updateData = { description: 'Updated' };
      const updatedFile = { ...mockFileRecord, ...updateData };
      mockFileManagerService.updateFile.mockResolvedValue(updatedFile);

      const result = await controller.updateFile('1', updateData);

      expect(result).toEqual(updatedFile);
      expect(service.updateFile).toHaveBeenCalledWith('1', updateData);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      const deleteResponse = { success: true };
      mockFileManagerService.deleteFile.mockResolvedValue(deleteResponse);

      const result = await controller.deleteFile('1');

      expect(result).toEqual(deleteResponse);
      expect(service.deleteFile).toHaveBeenCalledWith('1');
    });
  });
});
