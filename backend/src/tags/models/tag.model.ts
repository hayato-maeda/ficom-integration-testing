import { Field, Int, ObjectType } from '@nestjs/graphql';

/**
 * タグエンティティ
 * テストケースを分類するためのタグを表します。
 */
@ObjectType()
export class Tag {
  /** タグID */
  @Field(() => Int)
  id: number;

  /** タグ名 */
  @Field(() => String)
  name: string;

  /** カラーコード（例: #FF5733） */
  @Field(() => String, { nullable: true })
  color?: string | null;

  /** 作成日時 */
  @Field(() => Date)
  createdAt: Date;
}
