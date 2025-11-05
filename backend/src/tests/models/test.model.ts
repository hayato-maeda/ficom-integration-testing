import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Feature } from '../../features/models/feature.model';
import { User } from '../../users/models/user.model';

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
 * 機能（Feature）に属するテストを表します。
 * 各テストは複数のテストケースを持ちます。
 * 複合主キー: (featureId, id)
 */
@ObjectType()
export class Test {
  /** 機能ID (複合キーの一部) */
  @Field(() => Int)
  featureId: number;

  /** テストID (複合キーの一部) */
  @Field(() => Int)
  id: number;

  /** テスト名 */
  @Field(() => String)
  name: string;

  /** 説明 */
  @Field(() => String, { nullable: true })
  description?: string | null;

  /** ステータス */
  @Field(() => String)
  status: string;

  /** 作成者ID */
  @Field(() => Int)
  createdById: number;

  /** 作成日時 */
  @Field(() => Date)
  createdAt: Date;

  /** 更新日時 */
  @Field(() => Date)
  updatedAt: Date;

  /** 機能（リレーション） */
  @Field(() => Feature, { nullable: true })
  feature?: Feature;

  /** 作成者（リレーション） */
  @Field(() => User, { nullable: true })
  createdBy?: User;
}
