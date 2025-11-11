import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * 承認更新入力DTO
 * 承認のコメントを更新するための入力データ
 */
@InputType()
export class UpdateApprovalInput {
  @Field(() => Int)
  @IsInt({ message: 'id must be an integer' })
  @IsNotEmpty({ message: 'id should not be empty' })
  id: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'comment must be a string' })
  comment?: string;
}
