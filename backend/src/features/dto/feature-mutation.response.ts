import { Field, ObjectType } from '@nestjs/graphql';
import { TestCase } from '../../test-cases/models/test-case.model';
import { Feature } from '../models/feature.model';

/**
 * 機能Mutationレスポンス
 */
@ObjectType()
export class FeatureMutationResponse {
  /** 成功フラグ */
  @Field(() => Boolean)
  isValid: boolean;

  /** メッセージ */
  @Field(() => String)
  message: string;

  /** 機能データ */
  @Field(() => Feature, { nullable: true })
  data?: Feature | null;
}

/**
 * 機能割り当てMutationレスポンス
 */
@ObjectType()
export class FeatureAssignMutationResponse {
  /** 成功フラグ */
  @Field(() => Boolean)
  isValid: boolean;

  /** メッセージ */
  @Field(() => String)
  message: string;

  /** テストケースデータ */
  @Field(() => TestCase, { nullable: true })
  data?: TestCase | null;
}
