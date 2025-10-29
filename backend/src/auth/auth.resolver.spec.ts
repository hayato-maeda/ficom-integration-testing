import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let _authService: AuthService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    tokenValidFromTimestamp: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockAuthResponse = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
    user: mockUser,
  };

  const mockAuthService = {
    signUp: jest.fn(),
    login: jest.fn(),
    refreshAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    _authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('signUp', () => {
    it('should sign up a new user', async () => {
      mockAuthService.signUp.mockResolvedValue(mockAuthResponse);

      const result = await resolver.signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await resolver.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      mockAuthService.refreshAccessToken.mockResolvedValue(mockAuthResponse);

      const result = await resolver.refreshToken({
        refreshToken: 'refreshToken',
        oldAccessToken: 'oldAccessToken',
      });

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith('refreshToken', 'oldAccessToken');
    });
  });

  describe('me', () => {
    it('should return the current user', async () => {
      const result = await resolver.me(mockUser);

      expect(result).toEqual(mockUser);
    });
  });
});
