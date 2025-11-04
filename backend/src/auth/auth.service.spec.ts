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

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
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
      mockJwtService.sign.mockReturnValue('accessToken');
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
    const mockRefreshTokenPayload = {
      sub: 1,
      email: 'test@example.com',
      iat: Math.floor(Date.now() / 1000),
    };

    it('should refresh access token with valid JWT refresh token', async () => {
      mockJwtService.verify.mockReturnValue(mockRefreshTokenPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('newAccessToken');
      mockConfigService.get.mockReturnValue('7d');

      const result = await service.refreshAccessToken('validRefreshToken');

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('トークンの更新に成功しました');
      expect(result.data).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: expect.any(String),
        user: mockUser,
      });
      expect(mockJwtService.verify).toHaveBeenCalled();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should throw error when refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshAccessToken('invalidToken')).rejects.toThrow();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return error when user not found', async () => {
      mockJwtService.verify.mockReturnValue(mockRefreshTokenPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.refreshAccessToken('validRefreshToken');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('無効なリフレッシュトークンです');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return error when token was issued before tokenValidFromTimestamp', async () => {
      const oldTokenPayload = {
        ...mockRefreshTokenPayload,
        iat: Math.floor(Date.now() / 1000) - 86400, // 1日前
      };
      const userWithTimestamp = {
        ...mockUser,
        tokenValidFromTimestamp: new Date(), // 現在時刻
      };

      mockJwtService.verify.mockReturnValue(oldTokenPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(userWithTimestamp);

      const result = await service.refreshAccessToken('oldRefreshToken');

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('リフレッシュトークンは無効化されています');
      expect(result.data).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
