import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from '../files/files.service';
import { TagsService } from '../tags/tags.service';
import { TestCasesResolver } from './test-cases.resolver';
import { TestCasesService } from './test-cases.service';

describe('TestCasesResolver', () => {
  let resolver: TestCasesResolver;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed',
    tokenValidFromTimestamp: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockTestCase = {
    id: 1,
    title: 'Test Case',
    description: 'Test Description',
    steps: 'Test Steps',
    expectedResult: 'Expected Result',
    actualResult: undefined,
    status: 'DRAFT',
    createdById: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: mockUser,
  };

  const mockTag = {
    id: 1,
    name: 'Test Tag',
    color: '#FF0000',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
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
    testCase: mockTestCase,
    uploader: mockUser,
  };

  const mockTestCasesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockTagsService = {
    getTagsByTestCase: jest.fn(),
  };

  const mockFilesService = {
    findByTestCase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestCasesResolver,
        {
          provide: TestCasesService,
          useValue: mockTestCasesService,
        },
        {
          provide: TagsService,
          useValue: mockTagsService,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    resolver = module.get<TestCasesResolver>(TestCasesResolver);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createTestCase', () => {
    it('should create a test case', async () => {
      mockTestCasesService.create.mockResolvedValue(mockTestCase);

      const result = await resolver.createTestCase(
        {
          title: 'Test Case',
          description: 'Test Description',
          steps: 'Test Steps',
          expectedResult: 'Expected Result',
          actualResult: undefined,
        },
        mockUser,
      );

      expect(result).toEqual(mockTestCase);
      expect(mockTestCasesService.create).toHaveBeenCalledWith(
        {
          title: 'Test Case',
          description: 'Test Description',
          steps: 'Test Steps',
          expectedResult: 'Expected Result',
          actualResult: undefined,
        },
        1,
      );
    });
  });

  describe('testCases', () => {
    it('should return all test cases', async () => {
      const mockTestCases = [mockTestCase];
      mockTestCasesService.findAll.mockResolvedValue(mockTestCases);

      const result = await resolver.testCases();

      expect(result).toEqual(mockTestCases);
      expect(mockTestCasesService.findAll).toHaveBeenCalled();
    });
  });

  describe('testCase', () => {
    it('should return a test case by id', async () => {
      mockTestCasesService.findOne.mockResolvedValue(mockTestCase);

      const result = await resolver.testCase(1);

      expect(result).toEqual(mockTestCase);
      expect(mockTestCasesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('updateTestCase', () => {
    it('should update a test case', async () => {
      const updatedTestCase = { ...mockTestCase, title: 'Updated Title' };
      mockTestCasesService.update.mockResolvedValue(updatedTestCase);

      const result = await resolver.updateTestCase(
        {
          id: 1,
          title: 'Updated Title',
        },
        mockUser,
      );

      expect(result).toEqual(updatedTestCase);
      expect(mockTestCasesService.update).toHaveBeenCalledWith(
        {
          id: 1,
          title: 'Updated Title',
        },
        1,
      );
    });
  });

  describe('deleteTestCase', () => {
    it('should delete a test case', async () => {
      mockTestCasesService.remove.mockResolvedValue(mockTestCase);

      const result = await resolver.deleteTestCase(1, mockUser);

      expect(result).toEqual(mockTestCase);
      expect(mockTestCasesService.remove).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('tags', () => {
    it('should return tags for a test case', async () => {
      const mockTags = [mockTag];
      mockTagsService.getTagsByTestCase.mockResolvedValue(mockTags);

      const result = await resolver.tags(mockTestCase);

      expect(result).toEqual(mockTags);
      expect(mockTagsService.getTagsByTestCase).toHaveBeenCalledWith(1);
    });
  });

  describe('files', () => {
    it('should return files for a test case', async () => {
      const mockFiles = [mockFile];
      mockFilesService.findByTestCase.mockResolvedValue(mockFiles);

      const result = await resolver.files(mockTestCase);

      expect(result).toEqual(mockFiles);
      expect(mockFilesService.findByTestCase).toHaveBeenCalledWith(1);
    });
  });
});
