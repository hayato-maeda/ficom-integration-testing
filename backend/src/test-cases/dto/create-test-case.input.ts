import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * テストケース作成用の入力データ
 */
@InputType()
export class CreateTestCaseInput {
  /** 機能ID (テストが属する機能のID) */
  @Field(() => Int)
  @IsNotEmpty({ message: 'testFeatureId should not be empty' })
  @IsInt({ message: 'testFeatureId must be an integer' })
  testFeatureId: number;

  /** テストID */
  @Field(() => Int)
  @IsNotEmpty({ message: 'testId should not be empty' })
  @IsInt({ message: 'testId must be an integer' })
  testId: number;

  /** タイトル */
  @Field(() => String)
  @IsNotEmpty({ message: 'title should not be empty' })
  @IsString({ message: 'title must be a string' })
  title: string;

  /** 説明 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string;

  /** テスト手順 */
  @Field(() => String)
  @IsNotEmpty({ message: 'steps should not be empty' })
  @IsString({ message: 'steps must be a string' })
  steps: string;

  /** 期待結果 */
  @Field(() => String)
  @IsNotEmpty({ message: 'expectedResult should not be empty' })
  @IsString({ message: 'expectedResult must be a string' })
  expectedResult: string;

  /** 実績結果 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'actualResult must be a string' })
  actualResult?: string;
}
