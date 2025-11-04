import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

/**
 * 認証レスポンス（クライアント向け）
 * GraphQLレスポンスとして返却される情報
 *
 * 注意: accessTokenとrefreshTokenはセッションCookieで管理されるため、
 *      GraphQLレスポンスには含めません。
 */
@ObjectType()
export class AuthResponse {
  /** ユーザー情報 */
  @Field(() => User)
  user: User;

  /** アクセストークンの有効期限（UNIX timestamp ミリ秒） */
  @Field(() => Number)
  accessTokenExpiresAt: number;
}

/**
 * Meクエリレスポンス
 * 現在のユーザー情報とトークン有効期限を返す
 */
@ObjectType()
export class MeResponse {
  /** ユーザー情報 */
  @Field(() => User)
  user: User;

  /** アクセストークンの有効期限（UNIX timestamp ミリ秒） */
  @Field(() => Number)
  accessTokenExpiresAt: number;
}

/**
 * 認証レスポンス（内部用）
 * サービス層で使用され、トークン情報を含む
 */
export interface AuthResponseInternal {
  /** アクセストークン（JWT） - セッションに保存用 */
  accessToken: string;

  /** リフレッシュトークン - セッションに保存用 */
  refreshToken: string;

  /** ユーザー情報 */
  user: User;
}
