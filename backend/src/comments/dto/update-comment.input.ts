import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateCommentInput {
  @Field(() => Int)
  @IsInt({ message: 'id must be an integer' })
  @IsNotEmpty({ message: 'id should not be empty' })
  id: number;

  @Field()
  @IsString({ message: 'content must be a string' })
  @IsNotEmpty({ message: 'content should not be empty' })
  content: string;
}
