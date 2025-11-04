import { Field, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { AuthResponse, AuthResponseInternal } from './auth.response';

/**
 * 認証Mutationレスポンス（クライアント向け）
 * signUp, login, refreshTokenのGraphQLレスポンス
 */
@ObjectType()
export class AuthMutationResponse extends BaseResponse {
  /** 認証データ（ユーザー情報のみ）、失敗時はnull */
  @Field(() => AuthResponse, { nullable: true })
  data: AuthResponse | null;
}

/**
 * 認証Mutationレスポンス（内部用）
 * サービス層からResolver層への戻り値
 */
export interface AuthMutationResponseInternal extends BaseResponse {
  /** 認証データ（トークンとユーザー情報）、失敗時はnull */
  data: AuthResponseInternal | null;
}
