import { Field, Int, ObjectType } from '@nestjs/graphql';

/**
 * 機能ステータス定数
 */
export const FeatureStatus = {
  /** 計画中 */
  PLANNING: 'PLANNING',
  /** 開発中 */
  DEVELOPING: 'DEVELOPING',
  /** テスト中 */
  TESTING: 'TESTING',
  /** 完了 */
  COMPLETED: 'COMPLETED',
  /** 保留 */
  ON_HOLD: 'ON_HOLD',
} as const;

/**
 * 機能ステータスの型
 */
export type FeatureStatusType = (typeof FeatureStatus)[keyof typeof FeatureStatus];

/**
 * 機能エンティティ
 * テストケースをグループ化するための機能を表します。
 */
@ObjectType()
export class Feature {
  /** 機能ID */
  @Field(() => Int)
  id: number;

  /** 機能名 */
  @Field(() => String)
  name: string;

  /** 説明 */
  @Field(() => String, { nullable: true })
  description?: string | null;

  /** カラーコード（例: #FF5733） */
  @Field(() => String, { nullable: true })
  color?: string | null;

  /** ステータス */
  @Field(() => String)
  status: string;

  /** 作成日時 */
  @Field(() => Date)
  createdAt: Date;

  /** 更新日時 */
  @Field(() => Date)
  updatedAt: Date;
}
