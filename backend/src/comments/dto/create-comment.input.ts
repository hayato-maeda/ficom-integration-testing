import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field()
  @IsString({ message: 'content must be a string' })
  @IsNotEmpty({ message: 'content should not be empty' })
  content: string;

  @Field(() => Int)
  @IsInt({ message: 'featureId must be an integer' })
  @IsNotEmpty({ message: 'featureId should not be empty' })
  featureId: number;

  @Field(() => Int)
  @IsInt({ message: 'testId must be an integer' })
  @IsNotEmpty({ message: 'testId should not be empty' })
  testId: number;

  @Field(() => Int)
  @IsInt({ message: 'testCaseId must be an integer' })
  @IsNotEmpty({ message: 'testCaseId should not be empty' })
  testCaseId: number;
}
