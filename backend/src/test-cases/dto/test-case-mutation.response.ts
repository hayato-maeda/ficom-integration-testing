import { Field, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { TestCase } from '../models/test-case.model';

/**
 * テストケースMutationレスポンス
 * createTestCase, updateTestCase, deleteTestCaseの戻り値
 */
@ObjectType()
export class TestCaseMutationResponse extends BaseResponse {
  /** テストケースデータ、失敗時はnull */
  @Field(() => TestCase, { nullable: true })
  data: TestCase | null;
}
