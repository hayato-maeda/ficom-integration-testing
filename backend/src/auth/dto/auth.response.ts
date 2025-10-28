import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

/**
 * 認証レスポンス
 * サインアップ・ログイン時に返却される情報
 */
@ObjectType()
export class AuthResponse {
  /** アクセストークン（JWT） */
  @Field(() => String)
  accessToken: string;

  /** リフレッシュトークン */
  @Field(() => String)
  refreshToken: string;

  /** ユーザー情報 */
  @Field(() => User)
  user: User;
}
