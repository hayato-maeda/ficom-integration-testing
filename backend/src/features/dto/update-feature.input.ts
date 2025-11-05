import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { FeatureStatus } from '../models/feature.model';

/**
 * 機能更新用の入力データ
 */
@InputType()
export class UpdateFeatureInput {
  /** 機能ID */
  @Field(() => Int)
  @IsNotEmpty({ message: 'id should not be empty' })
  @IsInt({ message: 'id must be an integer' })
  id: number;

  /** 機能名 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  name?: string;

  /** 説明 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string;

  /** カラーコード（例: #FF5733） */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'color must be a string' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a valid hex color code (e.g., #FF5733)',
  })
  color?: string;

  /** ステータス */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'status must be a string' })
  @IsIn(Object.values(FeatureStatus), {
    message: `status must be one of: ${Object.values(FeatureStatus).join(', ')}`,
  })
  status?: string;
}
