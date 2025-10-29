import { Field, ID, InputType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

/**
 * テストケースへのタグ割り当て用の入力データ
 */
@InputType()
export class AssignTagInput {
  /** テストケースID */
  @Field(() => ID)
  @IsNotEmpty({ message: 'testCaseId should not be empty' })
  @IsInt({ message: 'testCaseId must be an integer' })
  testCaseId: number;

  /** タグID */
  @Field(() => ID)
  @IsNotEmpty({ message: 'tagId should not be empty' })
  @IsInt({ message: 'tagId must be an integer' })
  tagId: number;
}
