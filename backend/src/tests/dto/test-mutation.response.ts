import { Field, ObjectType } from '@nestjs/graphql';
import { Test } from '../models/test.model';

/**
 * テストMutationレスポンス
 */
@ObjectType()
export class TestMutationResponse {
  /** 成功フラグ */
  @Field(() => Boolean)
  isValid: boolean;

  /** メッセージ */
  @Field(() => String)
  message: string;

  /** テストデータ */
  @Field(() => Test, { nullable: true })
  data?: Test | null;
}
