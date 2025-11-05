import { Field, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { Test } from '../models/test.model';

/**
 * テストMutationレスポンス
 * createTest, updateTest, deleteTestの戻り値
 */
@ObjectType()
export class TestMutationResponse extends BaseResponse {
  /** テストデータ、失敗時はnull */
  @Field(() => Test, { nullable: true })
  data: Test | null;
}
