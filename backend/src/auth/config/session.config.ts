import { SessionOptions } from 'iron-session';

/**
 * セッションデータの型定義
 * iron-sessionで管理するセッション情報を定義します。
 */
export interface SessionData {
  /** アクセストークン(JWT) */
  accessToken?: string;
  /** リフレッシュトークン */
  refreshToken?: string;
  /** アクセストークンの有効期限（UNIX timestamp） */
  accessTokenExpiresAt?: number;
}

/**
 * iron-sessionの設定
 * セッションクッキーの設定とシークレットキーを定義します。
 */
export const getSessionConfig = (): SessionOptions => {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters long');
  }

  return {
    password,
    cookieName: 'ficom_session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7日間
      path: '/',
    },
  };
};
