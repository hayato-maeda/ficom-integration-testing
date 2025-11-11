import { Field, Int, ObjectType } from '@nestjs/graphql';
import { TestCase } from '../../test-cases/models/test-case.model';
import { User } from '../../users/models/user.model';

/**
 * 承認ステータス定数
 */
export const ApprovalStatus = {
  /** 承認待ち */
  PENDING: 'PENDING',
  /** 承認済み */
  APPROVED: 'APPROVED',
  /** 却下 */
  REJECTED: 'REJECTED',
} as const;

/**
 * 承認ステータスの型
 */
export type ApprovalStatusType = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

/**
 * 承認エンティティ
 * テストケースに対する承認・却下の情報を表します。
 */
@ObjectType()
export class Approval {
  /** 承認ID */
  @Field(() => Int)
  id: number;

  /** 機能ID */
  @Field(() => Int)
  featureId: number;

  /** テストID */
  @Field(() => Int)
  testId: number;

  /** テストケースID */
  @Field(() => Int)
  testCaseId: number;

  /** テストケース（リレーション） */
  @Field(() => TestCase, { nullable: true })
  testCase?: TestCase;

  /** ユーザーID */
  @Field(() => Int)
  userId: number;

  /** ユーザー */
  @Field(() => User)
  user: User;

  /** ステータス (PENDING, APPROVED, REJECTED) */
  @Field(() => String)
  status: string;

  /** コメント */
  @Field(() => String, { nullable: true })
  comment?: string | null;

  /** 作成日時 */
  @Field(() => Date)
  createdAt: Date;

  /** 更新日時 */
  @Field(() => Date)
  updatedAt: Date;
}
