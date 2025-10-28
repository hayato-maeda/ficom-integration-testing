import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthResponse } from './dto/auth.response';
import type { LoginInput } from './dto/login.input';
import type { SignUpInput } from './dto/signup.input';

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

    // JWT トークンを生成
    const accessToken = this.generateToken(user.id, user.email);

    return {
      accessToken,
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

    // JWT トークンを生成
    const accessToken = this.generateToken(user.id, user.email);

    return {
      accessToken,
      user,
    };
  }

  /**
   * JWT トークンを生成
   * @param userId - ユーザーID
   * @param email - メールアドレス
   * @returns JWT トークン
   * @private
   */
  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}
