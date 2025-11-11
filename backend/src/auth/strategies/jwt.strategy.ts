import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * JWT ペイロード
 * JWT トークンに含まれるユーザー情報
 */
export interface JwtPayload {
  /** ユーザーID（subject） */
  sub: number;
  /** メールアドレス */
  email: string;
  /** トークン発行時刻（UnixタイムスタンプSecond） */
  iat?: number;
}

/**
 * セッションCookieからJWTトークンを抽出する関数
 * @param req - Express リクエストオブジェクト
 * @returns JWT トークン or null
 */
const extractJwtFromSession = (req: Request): string | null => {
  if (req?.session?.accessToken) {
    return req.session.accessToken;
  }
  return null;
};

/**
 * JWT 認証ストラテジー
 * Passport を使用した JWT トークンの検証を行います。
 * セッションCookieからトークンを取得します。
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: extractJwtFromSession,
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  /**
   * JWT ペイロードを検証してユーザー情報を取得
   * @param req - Express リクエストオブジェクト
   * @param payload - JWT ペイロード
   * @returns ユーザー情報
   * @throws UnauthorizedException - ユーザーが見つからない、またはトークンが無効化されている場合
   */
  async validate(req: Request, payload: JwtPayload) {
    // セッションからトークンを取得
    const token = extractJwtFromSession(req);

    if (!token) {
      throw new UnauthorizedException('Token not found in session');
    }

    // ユーザーを取得
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // トークンの発行時刻が tokenValidFromTimestamp より前の場合は無効
    if (user.tokenValidFromTimestamp && payload.iat) {
      const tokenIssuedAt = new Date(payload.iat * 1000); // iatは秒単位なのでミリ秒単位に変換
      if (tokenIssuedAt < user.tokenValidFromTimestamp) {
        throw new UnauthorizedException('Token has been invalidated by re-login');
      }
    }

    return user;
  }
}
