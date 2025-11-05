import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TestStatus } from '../models/test.model';

/**
 * テスト更新用の入力データ
 */
@InputType()
export class UpdateTestInput {
  /** 機能ID */
  @Field(() => Int)
  @IsNotEmpty({ message: 'featureId should not be empty' })
  @IsInt({ message: 'featureId must be an integer' })
  featureId: number;

  /** テストID（機能内での連番） */
  @Field(() => Int)
  @IsNotEmpty({ message: 'id should not be empty' })
  @IsInt({ message: 'id must be an integer' })
  id: number;

  /** テスト名 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  name?: string;

  /** 説明 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string;

  /** ステータス */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'status must be a string' })
  @IsIn(Object.values(TestStatus), {
    message: `status must be one of: ${Object.values(TestStatus).join(', ')}`,
  })
  status?: string;
}
