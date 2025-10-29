import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

/**
 * タグ作成用の入力データ
 */
@InputType()
export class CreateTagInput {
  /** タグ名 */
  @Field(() => String)
  @IsNotEmpty({ message: 'name should not be empty' })
  @IsString({ message: 'name must be a string' })
  name: string;

  /** カラーコード（例: #FF5733） */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'color must be a string' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a valid hex color code (e.g., #FF5733)',
  })
  color?: string;
}
