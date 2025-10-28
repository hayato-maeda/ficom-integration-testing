import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * 時間文字列を秒数に変換するヘルパー関数
 * @param timeStr - 時間文字列（例: '7d', '1h', '30m'）または秒数
 * @returns 秒数
 */
function parseTimeToSeconds(timeStr: string): number {
  const timeUnits: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (match) {
    const value = Number.parseInt(match[1], 10);
    const unit = match[2];
    return value * (timeUnits[unit] || 1);
  }

  // 数値のみの場合は秒として扱う
  const seconds = Number.parseInt(timeStr, 10);
  if (!Number.isNaN(seconds)) {
    return seconds;
  }

  // デフォルトは7日
  return 604800;
}

/**
 * 認証モジュール
 * ユーザー認証に関する機能（サインアップ、ログイン、JWT 認証）を提供します。
 * Passport と JWT を使用した認証を実装しています。
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }
        const expiresInStr = configService.get<string>('JWT_EXPIRES_IN') || '7d';
        const expiresIn = parseTimeToSeconds(expiresInStr);
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
