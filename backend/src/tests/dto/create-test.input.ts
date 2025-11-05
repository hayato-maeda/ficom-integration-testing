import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * テスト作成用の入力データ
 */
@InputType()
export class CreateTestInput {
  /** 機能ID */
  @Field(() => Int)
  @IsInt({ message: 'featureId must be an integer' })
  @IsNotEmpty({ message: 'featureId should not be empty' })
  featureId: number;

  /** テスト名 */
  @Field(() => String)
  @IsNotEmpty({ message: 'name should not be empty' })
  @IsString({ message: 'name must be a string' })
  name: string;

  /** 説明 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string;

  /** ステータス */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'status must be a string' })
  status?: string;
}
