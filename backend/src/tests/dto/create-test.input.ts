import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * テスト作成用の入力データ
 */
@InputType()
export class CreateTestInput {
  /** 機能ID */
  @Field(() => Int)
  @IsNotEmpty({ message: 'featureId should not be empty' })
  @IsInt({ message: 'featureId must be an integer' })
  featureId: number;

  /** テスト名 */
  @Field(() => String)
  @IsNotEmpty({ message: 'title should not be empty' })
  @IsString({ message: 'title must be a string' })
  title: string;

  /** 説明 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string;
}
