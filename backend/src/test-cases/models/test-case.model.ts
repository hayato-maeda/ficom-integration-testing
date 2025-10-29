import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

/**
 * テストケースステータス定数
 */
export const TestCaseStatus = {
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
 * テストケースステータスの型
 */
export type TestCaseStatusType = (typeof TestCaseStatus)[keyof typeof TestCaseStatus];

/**
 * テストケースエンティティ
 * 結合テストの内容を表します。
 */
@ObjectType()
export class TestCase {
  /** テストケースID */
  @Field(() => ID)
  id: number;

  /** タイトル */
  @Field(() => String)
  title: string;

  /** 説明 */
  @Field(() => String, { nullable: true })
  description?: string | null;

  /** テスト手順 */
  @Field(() => String)
  steps: string;

  /** 期待結果 */
  @Field(() => String)
  expectedResult: string;

  /** 実績結果 */
  @Field(() => String, { nullable: true })
  actualResult?: string | null;

  /** ステータス */
  @Field(() => String)
  status: string;

  /** 作成者ID */
  @Field(() => ID)
  createdById: number;

  /** 作成者 */
  @Field(() => User)
  createdBy: User;

  /** 作成日時 */
  @Field(() => Date)
  createdAt: Date;

  /** 更新日時 */
  @Field(() => Date)
  updatedAt: Date;
}
