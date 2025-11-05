import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

/**
 * テストケースへの機能割り当て用の入力データ
 */
@InputType()
export class AssignFeatureInput {
  /** テストケースID */
  @Field(() => Int)
  @IsNotEmpty({ message: 'testCaseId should not be empty' })
  @IsInt({ message: 'testCaseId must be an integer' })
  testCaseId: number;

  /** 機能ID */
  @Field(() => Int)
  @IsNotEmpty({ message: 'featureId should not be empty' })
  @IsInt({ message: 'featureId must be an integer' })
  featureId: number;
}
