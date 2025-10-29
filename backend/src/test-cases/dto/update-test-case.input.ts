import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TestCaseStatus } from '../models/test-case.model';

/**
 * テストケース更新用の入力データ
 */
@InputType()
export class UpdateTestCaseInput {
  /** テストケースID */
  @Field(() => Int)
  @IsNotEmpty({ message: 'id should not be empty' })
  @IsInt({ message: 'id must be an integer' })
  id: number;

  /** タイトル */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  title?: string;

  /** 説明 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string;

  /** テスト手順 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'steps must be a string' })
  steps?: string;

  /** 期待結果 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'expectedResult must be a string' })
  expectedResult?: string;

  /** 実績結果 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'actualResult must be a string' })
  actualResult?: string;

  /** ステータス */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'status must be a string' })
  @IsIn(Object.values(TestCaseStatus), {
    message: `status must be one of: ${Object.values(TestCaseStatus).join(', ')}`,
  })
  status?: string;
}
