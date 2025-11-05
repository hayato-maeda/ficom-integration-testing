import { Field, Int, ObjectType } from '@nestjs/graphql';
import { File } from '../../files/models/file.model';
import { Tag } from '../../tags/models/tag.model';
import { User } from '../../users/models/user.model';
import { Feature } from '../../features/models/feature.model';

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
  /** 機能ID (テストが属する機能のID) */
  @Field(() => Int)
  testFeatureId: number;

  /** テストID */
  @Field(() => Int)
  testId: number;

  /** テストケースID */
  @Field(() => Int)
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
  @Field(() => Int)
  createdById: number;

  /** 作成者 */
  @Field(() => User)
  createdBy: User;

  /** タグ */
  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];

  /** ファイル */
  @Field(() => [File], { nullable: true })
  files?: File[];

  /** 機能 */
  @Field(() => [Feature], { nullable: true })
  features?: Feature[];

  /** 作成日時 */
  @Field(() => Date)
  createdAt: Date;

  /** 更新日時 */
  @Field(() => Date)
  updatedAt: Date;
}
