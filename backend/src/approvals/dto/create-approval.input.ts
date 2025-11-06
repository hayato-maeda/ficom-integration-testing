import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import { ApprovalStatus } from '../models/approval.model';

/**
 * 承認作成用の入力データ
 */
@InputType()
export class CreateApprovalInput {
  /** 機能ID */
  @Field(() => Int)
  @IsInt({ message: 'featureId must be an integer' })
  @IsNotEmpty({ message: 'featureId should not be empty' })
  featureId: number;

  /** テストID */
  @Field(() => Int)
  @IsInt({ message: 'testId must be an integer' })
  @IsNotEmpty({ message: 'testId should not be empty' })
  testId: number;

  /** テストケースID */
  @Field(() => Int)
  @IsInt({ message: 'testCaseId must be an integer' })
  @IsNotEmpty({ message: 'testCaseId should not be empty' })
  testCaseId: number;

  /** ステータス (APPROVED, REJECTED) */
  @Field(() => String)
  @IsNotEmpty({ message: 'status should not be empty' })
  @IsString({ message: 'status must be a string' })
  @IsIn([ApprovalStatus.APPROVED, ApprovalStatus.REJECTED], {
    message: 'status must be either APPROVED or REJECTED',
  })
  status: string;

  /** コメント */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'comment must be a string' })
  comment?: string;
}
