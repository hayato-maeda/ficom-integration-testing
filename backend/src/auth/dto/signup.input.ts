import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * サインアップ入力データ
 * 新規ユーザー登録時に必要な情報
 */
@InputType()
export class SignUpInput {
  /** メールアドレス */
  @Field(() => String)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /** パスワード（8文字以上） */
  @Field(() => String)
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  /** ユーザー名 */
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;
}
