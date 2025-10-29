import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getLoggerToken, PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from './files.service';

describe('FilesService', () => {
  let service: FilesService;
  let _prismaService: PrismaService;
  let _logger: PinoLogger;

  const mockPrismaService = {
    file: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    setContext: jest.fn(),
  };

  const mockFile = {
    id: 1,
    filename: 'test.txt',
    path: 'test-123.txt',
    mimeType: 'text/plain',
    size: 1024,
    testCaseId: 1,
    uploadedBy: 1,
    createdAt: new Date('2024-01-01'),
    testCase: {
      id: 1,
      title: 'Test Case',
      description: 'Test Description',
      steps: 'Test Steps',
      expectedResult: 'Expected Result',
      actualResult: null,
      createdById: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed',
        tokenValidFromTimestamp: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    },
    uploader: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed',
      tokenValidFromTimestamp: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: getLoggerToken(FilesService.name),
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    _prismaService = module.get<PrismaService>(PrismaService);
    _logger = module.get<PinoLogger>(getLoggerToken(FilesService.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a file record', async () => {
      mockPrismaService.file.create.mockResolvedValue(mockFile);

      const result = await service.create('test.txt', 'test-123.txt', 'text/plain', 1024, 1, 1);

      expect(result).toEqual(mockFile);
      expect(mockPrismaService.file.create).toHaveBeenCalledWith({
        data: {
          filename: 'test.txt',
          path: 'test-123.txt',
          mimeType: 'text/plain',
          size: 1024,
          testCaseId: 1,
          uploadedBy: 1,
        },
        include: {
          testCase: {
            include: {
              createdBy: true,
            },
          },
          uploader: true,
        },
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAll', () => {
    it('should return all files', async () => {
      const mockFiles = [mockFile];
      mockPrismaService.file.findMany.mockResolvedValue(mockFiles);

      const result = await service.findAll();

      expect(result).toEqual(mockFiles);
      expect(mockPrismaService.file.findMany).toHaveBeenCalledWith({
        include: {
          testCase: {
            include: {
              createdBy: true,
            },
          },
          uploader: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a file by id', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(mockFile);

      const result = await service.findOne(1);

      expect(result).toEqual(mockFile);
      expect(mockPrismaService.file.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          testCase: {
            include: {
              createdBy: true,
            },
          },
          uploader: true,
        },
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw NotFoundException when file not found', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('File with ID 999 not found');
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('findByTestCase', () => {
    it('should return files for a test case', async () => {
      const mockFiles = [mockFile];
      mockPrismaService.file.findMany.mockResolvedValue(mockFiles);

      const result = await service.findByTestCase(1);

      expect(result).toEqual(mockFiles);
      expect(mockPrismaService.file.findMany).toHaveBeenCalledWith({
        where: { testCaseId: 1 },
        include: {
          testCase: {
            include: {
              createdBy: true,
            },
          },
          uploader: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a file', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(mockFile);
      mockPrismaService.file.delete.mockResolvedValue(mockFile);

      const result = await service.remove(1);

      expect(result).toEqual(mockFile);
      expect(mockPrismaService.file.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.file.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          testCase: {
            include: {
              createdBy: true,
            },
          },
          uploader: true,
        },
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when file not found for deletion', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow('File with ID 999 not found');
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('getFilePath', () => {
    it('should return the absolute file path', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(mockFile);

      const result = await service.getFilePath(1);

      expect(result).toContain('uploads');
      expect(result).toContain(mockFile.path);
    });
  });
});
