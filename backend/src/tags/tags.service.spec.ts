import { Test, TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { TagsService } from './tags.service';

describe('TagsService', () => {
  let service: TagsService;

  const mockPrismaService = {
    tag: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    testCase: {
      findUnique: jest.fn(),
    },
    testCaseTag: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
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

  const mockTag = {
    id: 1,
    name: 'Test Tag',
    color: '#FF0000',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockTestCase = {
    id: 1,
    title: 'Test Case',
    description: 'Test Description',
    steps: 'Test Steps',
    expectedResult: 'Expected Result',
    actualResult: null,
    createdById: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PinoLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tag', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);
      mockPrismaService.tag.create.mockResolvedValue(mockTag);

      const result = await service.create({
        name: 'Test Tag',
        color: '#FF0000',
      });

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('タグを作成しました');
      expect(result.data).toEqual(mockTag);
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { name: 'Test Tag' },
      });
      expect(mockPrismaService.tag.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Tag',
          color: '#FF0000',
        },
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should return error when tag name already exists', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      const result = await service.create({
        name: 'Test Tag',
        color: '#FF0000',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('タグ名「Test Tag」は既に存在します');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all tags', async () => {
      const mockTags = [mockTag];
      mockPrismaService.tag.findMany.mockResolvedValue(mockTags);

      const result = await service.findAll();

      expect(result).toEqual(mockTags);
      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a tag by id', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      const result = await service.findOne(1);

      expect(result).toEqual(mockTag);
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockLogger.debug).toHaveBeenCalledTimes(1);
    });

    it('should return null when tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a tag', async () => {
      const updatedTag = { ...mockTag, name: 'Updated Tag' };
      mockPrismaService.tag.findUnique.mockResolvedValueOnce(mockTag);
      mockPrismaService.tag.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.tag.update.mockResolvedValue(updatedTag);

      const result = await service.update({
        id: 1,
        name: 'Updated Tag',
      });

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('タグを更新しました');
      expect(result.data).toEqual(updatedTag);
      expect(mockPrismaService.tag.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Tag' },
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should return error when tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      const result = await service.update({
        id: 999,
        name: 'Updated Tag',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('ID 999 のタグが見つかりません');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return error when new tag name already exists', async () => {
      const anotherTag = { ...mockTag, id: 2, name: 'Existing Tag' };
      mockPrismaService.tag.findUnique.mockResolvedValueOnce(mockTag);
      mockPrismaService.tag.findUnique.mockResolvedValueOnce(anotherTag);

      const result = await service.update({
        id: 1,
        name: 'Existing Tag',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('タグ名「Existing Tag」は既に存在します');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a tag', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.tag.delete.mockResolvedValue(mockTag);

      const result = await service.remove(1);

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('タグを削除しました');
      expect(result.data).toEqual(mockTag);
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.tag.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should return error when tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      const result = await service.remove(999);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('ID 999 のタグが見つかりません');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('assignTag', () => {
    it('should assign a tag to a test case', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(mockTestCase);
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.testCaseTag.findUnique.mockResolvedValue(null);
      mockPrismaService.testCaseTag.create.mockResolvedValue({
        testCaseId: 1,
        tagId: 1,
      });

      const result = await service.assignTag({
        testCaseId: 1,
        tagId: 1,
      });

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('タグを割り当てました');
      expect(result.data).toBe(true);
      expect(mockPrismaService.testCase.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.testCaseTag.create).toHaveBeenCalledWith({
        data: {
          testCaseId: 1,
          tagId: 1,
        },
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should return error when test case not found', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(null);

      const result = await service.assignTag({
        testCaseId: 999,
        tagId: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('ID 999 のテストケースが見つかりません');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return error when tag not found', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(mockTestCase);
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      const result = await service.assignTag({
        testCaseId: 1,
        tagId: 999,
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('ID 999 のタグが見つかりません');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return error when tag already assigned', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(mockTestCase);
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.testCaseTag.findUnique.mockResolvedValue({
        testCaseId: 1,
        tagId: 1,
      });

      const result = await service.assignTag({
        testCaseId: 1,
        tagId: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('このタグは既にテストケースに割り当てられています');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('unassignTag', () => {
    it('should unassign a tag from a test case', async () => {
      mockPrismaService.testCaseTag.findUnique.mockResolvedValue({
        testCaseId: 1,
        tagId: 1,
      });
      mockPrismaService.testCaseTag.delete.mockResolvedValue({
        testCaseId: 1,
        tagId: 1,
      });

      const result = await service.unassignTag(1, 1);

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('タグの割り当てを解除しました');
      expect(result.data).toBe(true);
      expect(mockPrismaService.testCaseTag.findUnique).toHaveBeenCalledWith({
        where: {
          testCaseId_tagId: {
            testCaseId: 1,
            tagId: 1,
          },
        },
      });
      expect(mockPrismaService.testCaseTag.delete).toHaveBeenCalledWith({
        where: {
          testCaseId_tagId: {
            testCaseId: 1,
            tagId: 1,
          },
        },
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should return error when assignment not found', async () => {
      mockPrismaService.testCaseTag.findUnique.mockResolvedValue(null);

      const result = await service.unassignTag(999, 1);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('このタグはテストケースに割り当てられていません');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('getTagsByTestCase', () => {
    it('should return tags for a test case', async () => {
      const mockTestCaseTags = [
        {
          testCaseId: 1,
          tagId: 1,
          tag: mockTag,
        },
      ];
      mockPrismaService.testCaseTag.findMany.mockResolvedValue(mockTestCaseTags);

      const result = await service.getTagsByTestCase(1);

      expect(result).toEqual([mockTag]);
      expect(mockPrismaService.testCaseTag.findMany).toHaveBeenCalledWith({
        where: { testCaseId: 1 },
        include: { tag: true },
      });
      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
    });
  });
});
