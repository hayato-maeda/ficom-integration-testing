import { Field, Int, ObjectType } from '@nestjs/graphql';

/**
 * テストエンティティ
 * Feature配下のテストを表します。
 */
@ObjectType()
export class Test {
  /** テストID */
  @Field(() => Int)
  id: number;

  /** 機能ID */
  @Field(() => Int)
  featureId: number;

  /** テスト名 */
  @Field(() => String)
  title: string;

  /** 説明 */
  @Field(() => String, { nullable: true })
  description?: string | null;

  /** 作成日時 */
  @Field(() => Date)
  createdAt: Date;

  /** 更新日時 */
  @Field(() => Date)
  updatedAt: Date;
}
