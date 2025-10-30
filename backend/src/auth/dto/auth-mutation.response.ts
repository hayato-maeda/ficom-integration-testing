import { Field, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { AuthResponse } from './auth.response';

/**
 * 認証Mutationレスポンス
 * signUp, login, refreshTokenの戻り値
 */
@ObjectType()
export class AuthMutationResponse extends BaseResponse {
  /** 認証データ（トークンとユーザー情報）、失敗時はnull */
  @Field(() => AuthResponse, { nullable: true })
  data: AuthResponse | null;
}
