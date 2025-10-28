import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';

/**
 * ユーザーエンティティ
 * システムを利用するユーザーの情報を表します。
 */
@ObjectType()
export class User {
  /** ユーザーID */
  @Field(() => ID)
  id: string;

  /** メールアドレス */
  @Field(() => String)
  email: string;

  /** パスワード（GraphQLスキーマから隠蔽） */
  @HideField()
  password: string;

  /** ユーザー名 */
  @Field(() => String)
  name: string;

  /** 作成日時 */
  @Field(() => Date)
  createdAt: Date;

  /** 更新日時 */
  @Field(() => Date)
  updatedAt: Date;
}
