import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
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
}

/**
 * JWT 認証ストラテジー
 * Passport を使用した JWT トークンの検証を行います。
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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * JWT ペイロードを検証してユーザー情報を取得
   * @param payload - JWT ペイロード
   * @returns ユーザー情報
   * @throws UnauthorizedException - ユーザーが見つからない場合
   */
  async validate(payload: JwtPayload) {
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
