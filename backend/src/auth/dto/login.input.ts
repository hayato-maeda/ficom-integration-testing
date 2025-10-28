import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * ログイン入力データ
 * ユーザーログイン時に必要な情報
 */
@InputType()
export class LoginInput {
  /** メールアドレス */
  @Field(() => String)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /** パスワード */
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  password: string;
}
