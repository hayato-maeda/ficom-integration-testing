import { Field, HideField, Int, ObjectType } from '@nestjs/graphql';

/**
 * ユーザーエンティティ
 * システムを利用するユーザーの情報を表します。
 */
@ObjectType()
export class User {
  /** ユーザーID */
  @Field(() => Int)
  id: number;

  /** メールアドレス */
  @Field(() => String)
  email: string;

  /** パスワード（GraphQLスキーマから隠蔽） */
  @HideField()
  password: string;

  /** ユーザー名 */
  @Field(() => String)
  name: string;

  /** 権限（USER, ADMIN） */
  @Field(() => String)
  role: string;

  /** 作成日時 */
  @Field(() => Date)
  createdAt: Date;

  /** 更新日時 */
  @Field(() => Date)
  updatedAt: Date;
}
