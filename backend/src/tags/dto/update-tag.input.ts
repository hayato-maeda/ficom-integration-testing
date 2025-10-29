import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

/**
 * タグ更新用の入力データ
 */
@InputType()
export class UpdateTagInput {
  /** タグID */
  @Field(() => Int)
  @IsNotEmpty({ message: 'id should not be empty' })
  @IsInt({ message: 'id must be an integer' })
  id: number;

  /** タグ名 */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  name?: string;

  /** カラーコード（例: #FF5733） */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'color must be a string' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a valid hex color code (e.g., #FF5733)',
  })
  color?: string;
}
