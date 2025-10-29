import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { TagsService } from './tags.service';

describe('TagsService', () => {
  let service: TagsService;
  let _prismaService: PrismaService;
  let _logger: PinoLogger;

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
    _prismaService = module.get<PrismaService>(PrismaService);
    _logger = module.get<PinoLogger>(PinoLogger);

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

      expect(result).toEqual(mockTag);
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

    it('should throw ConflictException when tag name already exists', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      await expect(
        service.create({
          name: 'Test Tag',
          color: '#FF0000',
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create({
          name: 'Test Tag',
          color: '#FF0000',
        }),
      ).rejects.toThrow('Tag with name "Test Tag" already exists');
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
      expect(mockLogger.debug).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Tag with ID 999 not found');
      expect(mockLogger.warn).toHaveBeenCalled();
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

      expect(result).toEqual(updatedTag);
      expect(mockPrismaService.tag.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Tag' },
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(
        service.update({
          id: 999,
          name: 'Updated Tag',
        }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update({
          id: 999,
          name: 'Updated Tag',
        }),
      ).rejects.toThrow('Tag with ID 999 not found');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should throw ConflictException when new tag name already exists', async () => {
      const anotherTag = { ...mockTag, id: 2, name: 'Existing Tag' };
      mockPrismaService.tag.findUnique.mockResolvedValueOnce(mockTag);
      mockPrismaService.tag.findUnique.mockResolvedValueOnce(anotherTag);

      const updatePromise = service.update({
        id: 1,
        name: 'Existing Tag',
      });

      await expect(updatePromise).rejects.toThrow(ConflictException);
      await expect(updatePromise).rejects.toThrow('Tag with name "Existing Tag" already exists');
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a tag', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.tag.delete.mockResolvedValue(mockTag);

      const result = await service.remove(1);

      expect(result).toEqual(mockTag);
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.tag.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow('Tag with ID 999 not found');
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

      expect(result).toBe(true);
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

    it('should throw NotFoundException when test case not found', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(null);

      await expect(
        service.assignTag({
          testCaseId: 999,
          tagId: 1,
        }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.assignTag({
          testCaseId: 999,
          tagId: 1,
        }),
      ).rejects.toThrow('Test case with ID 999 not found');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should throw NotFoundException when tag not found', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(mockTestCase);
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(
        service.assignTag({
          testCaseId: 1,
          tagId: 999,
        }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.assignTag({
          testCaseId: 1,
          tagId: 999,
        }),
      ).rejects.toThrow('Tag with ID 999 not found');
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should throw ConflictException when tag already assigned', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(mockTestCase);
      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.testCaseTag.findUnique.mockResolvedValue({
        testCaseId: 1,
        tagId: 1,
      });

      await expect(
        service.assignTag({
          testCaseId: 1,
          tagId: 1,
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.assignTag({
          testCaseId: 1,
          tagId: 1,
        }),
      ).rejects.toThrow('Tag is already assigned to this test case');
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

      expect(result).toBe(true);
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

    it('should throw NotFoundException when assignment not found', async () => {
      mockPrismaService.testCaseTag.findUnique.mockResolvedValue(null);

      await expect(service.unassignTag(999, 1)).rejects.toThrow(NotFoundException);
      await expect(service.unassignTag(999, 1)).rejects.toThrow('Tag is not assigned to this test case');
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
