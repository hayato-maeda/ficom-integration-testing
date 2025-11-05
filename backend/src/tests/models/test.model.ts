import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Feature } from '../../features/models/feature.model';
import { TestCase } from '../../test-cases/models/test-case.model';

/**
 * テストステータス定数
 */
export const TestStatus = {
  /** 下書き */
  DRAFT: 'DRAFT',
  /** レビュー中 */
  IN_REVIEW: 'IN_REVIEW',
  /** 承認済み */
  APPROVED: 'APPROVED',
  /** 却下 */
  REJECTED: 'REJECTED',
  /** アーカイブ */
  ARCHIVED: 'ARCHIVED',
} as const;

/**
 * テストステータスの型
 */
export type TestStatusType = (typeof TestStatus)[keyof typeof TestStatus];

/**
 * テストエンティティ
 * Featureに紐づくテストを表します。
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
  name: string;

  /** 説明 */
  @Field(() => String, { nullable: true })
  description?: string | null;

  /** ステータス */
  @Field(() => String)
  status: string;

  /** 機能 */
  @Field(() => Feature)
  feature: Feature;

  /** テストケース */
  @Field(() => [TestCase], { nullable: true })
  testCases?: TestCase[];

  /** 作成日時 */
  @Field(() => Date)
  createdAt: Date;

  /** 更新日時 */
  @Field(() => Date)
  updatedAt: Date;
}
