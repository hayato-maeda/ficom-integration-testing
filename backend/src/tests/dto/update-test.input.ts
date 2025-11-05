import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  /** テストID */
  @Field(() => Int)
  @IsNotEmpty({ message: 'id should not be empty' })
  @IsInt({ message: 'id must be an integer' })
  id: number;

  /** テスト名 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  title?: string;

  /** 説明 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string;
}
