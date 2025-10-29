import { Test, TestingModule } from '@nestjs/testing';
import { FilesResolver } from './files.resolver';
import { FilesService } from './files.service';

describe('FilesResolver', () => {
  let resolver: FilesResolver;
  let _filesService: FilesService;

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

  const mockFilesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByTestCase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesResolver,
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    resolver = module.get<FilesResolver>(FilesResolver);
    _filesService = module.get<FilesService>(FilesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('files', () => {
    it('should return all files', async () => {
      const mockFiles = [mockFile];
      mockFilesService.findAll.mockResolvedValue(mockFiles);

      const result = await resolver.files();

      expect(result).toEqual(mockFiles);
      expect(mockFilesService.findAll).toHaveBeenCalled();
    });
  });

  describe('file', () => {
    it('should return a file by id', async () => {
      mockFilesService.findOne.mockResolvedValue(mockFile);

      const result = await resolver.file(1);

      expect(result).toEqual(mockFile);
      expect(mockFilesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('filesByTestCase', () => {
    it('should return files for a test case', async () => {
      const mockFiles = [mockFile];
      mockFilesService.findByTestCase.mockResolvedValue(mockFiles);

      const result = await resolver.filesByTestCase(1);

      expect(result).toEqual(mockFiles);
      expect(mockFilesService.findByTestCase).toHaveBeenCalledWith(1);
    });
  });
});
