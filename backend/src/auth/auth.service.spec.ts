import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let _prismaService: PrismaService;
  let _jwtService: JwtService;
  let _configService: ConfigService;
  let _logger: PinoLogger;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    revokedToken: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
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
    password: 'hashedPassword',
    tokenValidFromTimestamp: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PinoLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    _prismaService = module.get<PrismaService>(PrismaService);
    _jwtService = module.get<JwtService>(JwtService);
    _configService = module.get<ConfigService>(ConfigService);
    _logger = module.get<PinoLogger>(PinoLogger);

    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue('1h');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user and return auth response', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('accessToken');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: 1,
        token: 'refreshToken',
        userId: 1,
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
      });
      mockConfigService.get.mockReturnValue('7d');

      const result = await service.signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('ユーザー登録が完了しました');
      expect(result.data).toEqual({
        accessToken: 'accessToken',
        refreshToken: expect.any(String),
        user: mockUser,
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should return error when email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('このメールアドレスは既に登録されています');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return error when password is less than 8 characters', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.signUp({
        email: 'test@example.com',
        password: 'short',
        name: 'Test User',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('パスワードは8文字以上で入力してください');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user and return auth response', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      mockJwtService.sign.mockReturnValue('accessToken');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: 1,
        token: 'refreshToken',
        userId: 1,
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
      });
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      mockConfigService.get.mockReturnValue('7d');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('ログインに成功しました');
      expect(result.data).toEqual({
        accessToken: 'accessToken',
        refreshToken: expect.any(String),
        user: mockUser,
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should return error when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('メールアドレスまたはパスワードが正しくありません');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return error when password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('メールアドレスまたはパスワードが正しくありません');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    const mockRefreshToken = {
      id: 1,
      token: 'refreshToken',
      userId: 1,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
      createdAt: new Date(),
      user: mockUser,
    };

    it('should refresh access token', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);
      mockPrismaService.revokedToken.create.mockResolvedValue({});
      mockPrismaService.refreshToken.update.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('newAccessToken');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: 2,
        token: 'newRefreshToken',
        userId: 1,
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
      });
      mockConfigService.get.mockReturnValue('7d');

      const result = await service.refreshAccessToken('refreshToken', 'oldAccessToken');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('トークンの更新に成功しました');
      expect(result.data).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: expect.any(String),
        user: mockUser,
      });
      expect(mockPrismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'refreshToken' },
        include: { user: true },
      });
      expect(mockPrismaService.revokedToken.create).toHaveBeenCalled();
      expect(mockPrismaService.refreshToken.update).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should return error when refresh token not found', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      const result = await service.refreshAccessToken('invalidToken', 'oldAccessToken');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('無効なリフレッシュトークンです');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return error when refresh token is revoked', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        ...mockRefreshToken,
        isRevoked: true,
      });

      const result = await service.refreshAccessToken('refreshToken', 'oldAccessToken');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('リフレッシュトークンは無効化されています');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return error when refresh token is expired', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000),
      });

      const result = await service.refreshAccessToken('refreshToken', 'oldAccessToken');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('リフレッシュトークンの有効期限が切れています');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
