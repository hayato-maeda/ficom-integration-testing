import { randomUUID } from 'node:crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthResponse } from './dto/auth.response';
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
  ) {}

  /**
   * 新規ユーザー登録
   * @param signUpInput - サインアップ入力データ
   * @returns 認証レスポンス（JWT トークンとユーザー情報）
   * @throws ConflictException - メールアドレスが既に登録されている場合
   */
  async signUp(signUpInput: SignUpInput): Promise<AuthResponse> {
    const { email, password, name } = signUpInput;

    // ユーザーが既に存在するか確認
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザーを作成
    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // JWT アクセストークンを生成
    const accessToken = this.generateToken(user.id, user.email);

    // リフレッシュトークンを生成
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * ログイン
   * @param loginInput - ログイン入力データ
   * @returns 認証レスポンス（JWT トークンとユーザー情報）
   * @throws UnauthorizedException - 認証情報が無効な場合
   */
  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;

    // ユーザーを検索
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // パスワードを検証
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // JWT アクセストークンを生成
    const accessToken = this.generateToken(user.id, user.email);

    // リフレッシュトークンを生成
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * リフレッシュトークンを使用してアクセストークンを更新
   * @param refreshToken - リフレッシュトークン
   * @returns 新しい認証レスポンス
   * @throws UnauthorizedException - リフレッシュトークンが無効な場合
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    // リフレッシュトークンを検証
    const storedToken = await this.prismaService.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // 古いリフレッシュトークンを無効化（トークンローテーション）
    await this.prismaService.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // 新しいアクセストークンとリフレッシュトークンを生成
    const newAccessToken = this.generateToken(storedToken.userId, storedToken.user.email);
    const newRefreshToken = await this.createRefreshToken(storedToken.userId);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: storedToken.user,
    };
  }

  /**
   * JWT トークンを生成
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
   * リフレッシュトークンを生成してデータベースに保存
   * @param userId - ユーザーID
   * @returns リフレッシュトークン文字列
   * @private
   */
  private async createRefreshToken(userId: number): Promise<string> {
    // ランダムなトークンを生成
    const token = randomUUID();

    // 有効期限を計算
    const expiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d';
    const expiresInMs = this.parseTimeString(expiresIn);
    const expiresAt = new Date(Date.now() + expiresInMs);

    // データベースに保存
    await this.prismaService.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * 時間文字列をミリ秒に変換
   * @param timeString - 時間文字列（例: "1h", "7d", "30m", "60s"）
   * @returns ミリ秒
   * @private
   */
  private parseTimeString(timeString: string): number {
    const regex = /^(\d+)([smhd])$/;
    const match = timeString.match(regex);

    if (!match) {
      throw new Error(`Invalid time format: ${timeString}`);
    }

    const value = Number.parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000, // seconds
      m: 60 * 1000, // minutes
      h: 60 * 60 * 1000, // hours
      d: 24 * 60 * 60 * 1000, // days
    };

    return value * multipliers[unit];
  }
}
