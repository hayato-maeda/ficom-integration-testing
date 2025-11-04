import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PinoLogger } from 'nestjs-pino';
import { AUTH_MESSAGES } from '../common/messages/auth.messages';
import { PrismaService } from '../prisma/prisma.service';
import { AuthMutationResponseInternal } from './dto/auth-mutation.response';
import { LoginInput } from './dto/login.input';
import { SignUpInput } from './dto/signup.input';

/**
 * 認証サービス
 * ユーザーの登録、ログイン、JWT トークン生成を管理します。
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  /**
   * 新規ユーザー登録
   * @param signUpInput - サインアップ入力データ
   * @returns 認証Mutationレスポンス（内部用、トークン含む）
   */
  async signUp(signUpInput: SignUpInput): Promise<AuthMutationResponseInternal> {
    const { email, password, name } = signUpInput;

    this.logger.info({ email }, 'User registration started');

    // ユーザーが既に存在するか確認
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn({ email }, 'Registration attempt with existing email');
      return {
        isValid: false,
        message: AUTH_MESSAGES.EMAIL_ALREADY_EXISTS,
        data: null,
      };
    }

    // パスワードのバリデーション（8文字以上）
    if (password.length < 8) {
      this.logger.warn({ email }, 'Registration attempt with invalid password');
      return {
        isValid: false,
        message: AUTH_MESSAGES.PASSWORD_TOO_SHORT,
        data: null,
      };
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // トークン有効化タイムスタンプを準備（JWT の iat は秒単位なのでミリ秒を0にする）
    const tokenValidFrom = new Date(Math.floor(Date.now() / 1000) * 1000);

    // ユーザーを作成（トークン有効化タイムスタンプを設定）
    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        tokenValidFromTimestamp: tokenValidFrom,
      },
    });

    this.logger.info({ userId: user.id, email: user.email }, 'User registered successfully');

    // JWT アクセストークンを生成
    const accessToken = this.generateToken(user.id, user.email);

    // リフレッシュトークンを生成（JWT形式）
    const refreshToken = this.generateRefreshToken(user.id, user.email);

    return {
      isValid: true,
      message: AUTH_MESSAGES.SIGNUP_SUCCESS,
      data: {
        accessToken,
        refreshToken,
        user,
      },
    };
  }

  /**
   * ログイン
   * @param loginInput - ログイン入力データ
   * @returns 認証Mutationレスポンス（内部用、トークン含む）
   */
  async login(loginInput: LoginInput): Promise<AuthMutationResponseInternal> {
    const { email, password } = loginInput;

    this.logger.info({ email }, 'Login attempt');

    // ユーザーを検索
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.warn({ email }, 'Login failed: user not found');
      return {
        isValid: false,
        message: AUTH_MESSAGES.INVALID_CREDENTIALS,
        data: null,
      };
    }

    // パスワードを検証
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn({ userId: user.id, email }, 'Login failed: invalid password');
      return {
        isValid: false,
        message: AUTH_MESSAGES.INVALID_CREDENTIALS,
        data: null,
      };
    }

    // トークン有効化タイムスタンプを現在時刻に更新（既存トークンをすべて無効化）
    // JWT の iat は秒単位なので、ミリ秒を0にして精度を合わせる
    const tokenValidFrom = new Date(Math.floor(Date.now() / 1000) * 1000);
    const updatedUser = await this.prismaService.user.update({
      where: { id: user.id },
      data: { tokenValidFromTimestamp: tokenValidFrom },
    });

    this.logger.debug({ userId: user.id }, 'Previous sessions invalidated via tokenValidFromTimestamp');

    // JWT アクセストークンを生成
    const accessToken = this.generateToken(user.id, user.email);

    // リフレッシュトークンを生成（JWT形式）
    const refreshToken = this.generateRefreshToken(user.id, user.email);

    this.logger.info({ userId: user.id, email: user.email }, 'Login successful');

    return {
      isValid: true,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      data: {
        accessToken,
        refreshToken,
        user: updatedUser,
      },
    };
  }

  /**
   * リフレッシュトークンを使用してアクセストークンを更新
   * @param refreshToken - リフレッシュトークン（JWT）
   * @returns 認証Mutationレスポンス（内部用、トークン含む）
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthMutationResponseInternal> {
    this.logger.debug('Token refresh attempt');

    try {
      // リフレッシュトークンをJWTとして検証（有効期限・署名チェック）
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // ユーザーを取得してtokenValidFromTimestampをチェック
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        this.logger.warn({ userId: payload.sub }, 'Token refresh failed: user not found');
        return {
          isValid: false,
          message: AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
          data: null,
        };
      }

      // トークンの発行時刻が tokenValidFromTimestamp より前の場合は無効
      if (user.tokenValidFromTimestamp && payload.iat) {
        const tokenIssuedAt = new Date(payload.iat * 1000);
        if (tokenIssuedAt < user.tokenValidFromTimestamp) {
          this.logger.warn({ userId: user.id }, 'Token refresh failed: token invalidated by re-login');
          return {
            isValid: false,
            message: AUTH_MESSAGES.REFRESH_TOKEN_REVOKED,
            data: null,
          };
        }
      }

      this.logger.debug({ userId: user.id }, 'Issuing new tokens');

      // 新しいアクセストークンとリフレッシュトークンを生成
      const newAccessToken = this.generateToken(user.id, user.email);
      const newRefreshToken = this.generateRefreshToken(user.id, user.email);

      this.logger.info({ userId: user.id }, 'Token refresh successful');

      return {
        isValid: true,
        message: AUTH_MESSAGES.TOKEN_REFRESH_SUCCESS,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user,
        },
      };
    } catch (error) {
      this.logger.warn({ error: error.message }, 'Token refresh failed: invalid token');
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }

  /**
   * JWT アクセストークンを生成
   * @param userId - ユーザーID
   * @param email - メールアドレス
   * @returns JWT トークン
   * @private
   */
  private generateToken(userId: number, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  /**
   * JWT リフレッシュトークンを生成
   * アクセストークンよりも長い有効期限を持つJWTトークンを生成します。
   * @param userId - ユーザーID
   * @param email - メールアドレス
   * @returns JWT リフレッシュトークン
   * @private
   */
  private generateRefreshToken(userId: number, email: string): string {
    const payload = { sub: userId, email };
    // リフレッシュトークンの有効期限（文字列形式: '7d'）
    const refreshExpiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d';
    // 秒数に変換
    const expiresInSeconds = this.parseTimeToSeconds(refreshExpiresIn);
    // JwtModuleで設定されたsecretを使用し、有効期限のみオーバーライド
    return this.jwtService.sign(payload, { expiresIn: expiresInSeconds });
  }

  /**
   * 時間文字列を秒数に変換
   * @param timeString - 時間文字列（例: '7d', '1h', '30m', '60s'）
   * @returns 秒数
   * @private
   */
  private parseTimeToSeconds(timeString: string): number {
    const timeUnits: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = timeString.match(/^(\d+)([smhd])$/);
    if (match) {
      const value = Number.parseInt(match[1], 10);
      const unit = match[2];
      return value * (timeUnits[unit] || 1);
    }

    // 数値のみの場合は秒として扱う
    const seconds = Number.parseInt(timeString, 10);
    if (!Number.isNaN(seconds)) {
      return seconds;
    }

    // デフォルトは7日
    return 604800;
  }
}
