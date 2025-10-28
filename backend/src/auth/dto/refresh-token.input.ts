import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * リフレッシュトークン入力
 * トークン更新時に使用する入力データ
 */
@InputType()
export class RefreshTokenInput {
  /** リフレッシュトークン */
  @Field(() => String)
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString()
  refreshToken: string;
}
