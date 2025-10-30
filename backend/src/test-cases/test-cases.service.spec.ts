import { Test, TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { TestCasesService } from './test-cases.service';

describe('TestCasesService', () => {
  let service: TestCasesService;
  let _prismaService: PrismaService;
  let _logger: PinoLogger;

  const mockPrismaService = {
    testCase: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestCasesService,
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

    service = module.get<TestCasesService>(TestCasesService);
    _prismaService = module.get<PrismaService>(PrismaService);
    _logger = module.get<PinoLogger>(PinoLogger);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a test case', async () => {
      mockPrismaService.testCase.create.mockResolvedValue(mockTestCase);

      const result = await service.create(
        {
          title: 'Test Case',
          description: 'Test Description',
          steps: 'Test Steps',
          expectedResult: 'Expected Result',
          actualResult: undefined,
        },
        1,
      );

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('テストケースを作成しました');
      expect(result.data).toEqual(mockTestCase);
      expect(mockPrismaService.testCase.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Case',
          description: 'Test Description',
          steps: 'Test Steps',
          expectedResult: 'Expected Result',
          actualResult: undefined,
          createdById: 1,
        },
        include: {
          createdBy: true,
        },
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAll', () => {
    it('should return all test cases', async () => {
      const mockTestCases = [mockTestCase];
      mockPrismaService.testCase.findMany.mockResolvedValue(mockTestCases);

      const result = await service.findAll();

      expect(result).toEqual(mockTestCases);
      expect(mockPrismaService.testCase.findMany).toHaveBeenCalledWith({
        include: {
          createdBy: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a test case by id', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(mockTestCase);

      const result = await service.findOne(1);

      expect(result).toEqual(mockTestCase);
      expect(mockPrismaService.testCase.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          createdBy: true,
        },
      });
      expect(mockLogger.debug).toHaveBeenCalledTimes(1);
    });

    it('should return null when test case not found', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a test case', async () => {
      const updatedTestCase = { ...mockTestCase, title: 'Updated Title' };
      mockPrismaService.testCase.findUnique.mockResolvedValue(mockTestCase);
      mockPrismaService.testCase.update.mockResolvedValue(updatedTestCase);

      const result = await service.update(
        {
          id: 1,
          title: 'Updated Title',
        },
        1,
      );

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('テストケースを更新しました');
      expect(result.data).toEqual(updatedTestCase);
      expect(mockPrismaService.testCase.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.testCase.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'Updated Title' },
        include: {
          createdBy: true,
        },
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should return error when test case not found', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(null);

      const result = await service.update(
        {
          id: 999,
          title: 'Updated Title',
        },
        1,
      );

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('ID 999 のテストケースが見つかりません');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return error when user is not the creator', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(mockTestCase);

      const result = await service.update(
        {
          id: 1,
          title: 'Updated Title',
        },
        2, // Different user ID
      );

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('テストケースの作成者のみ更新できます');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a test case', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(mockTestCase);
      mockPrismaService.testCase.delete.mockResolvedValue(mockTestCase);

      const result = await service.remove(1, 1);

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('テストケースを削除しました');
      expect(result.data).toEqual(mockTestCase);
      expect(mockPrismaService.testCase.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          createdBy: true,
        },
      });
      expect(mockPrismaService.testCase.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should return error when test case not found', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(null);

      const result = await service.remove(999, 1);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('ID 999 のテストケースが見つかりません');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return error when user is not the creator', async () => {
      mockPrismaService.testCase.findUnique.mockResolvedValue(mockTestCase);

      const result = await service.remove(1, 2);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('テストケースの作成者のみ削除できます');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
