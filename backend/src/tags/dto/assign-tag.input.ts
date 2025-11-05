import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

/**
 * テストケースへのタグ割り当て用の入力データ
 */
@InputType()
export class AssignTagInput {
  /** 機能ID */
  @Field(() => Int)
  @IsNotEmpty({ message: 'featureId should not be empty' })
  @IsInt({ message: 'featureId must be an integer' })
  featureId: number;

  /** テストID */
  @Field(() => Int)
  @IsNotEmpty({ message: 'testId should not be empty' })
  @IsInt({ message: 'testId must be an integer' })
  testId: number;

  /** テストケースID */
  @Field(() => Int)
  @IsNotEmpty({ message: 'testCaseId should not be empty' })
  @IsInt({ message: 'testCaseId must be an integer' })
  testCaseId: number;

  /** タグID */
  @Field(() => Int)
  @IsNotEmpty({ message: 'tagId should not be empty' })
  @IsInt({ message: 'tagId must be an integer' })
  tagId: number;
}
