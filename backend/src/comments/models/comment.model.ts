import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { TestCase } from '../../test-cases/models/test-case.model';

@ObjectType()
export class Comment {
  @Field(() => Int)
  id: number;

  @Field()
  content: string;

  @Field(() => Int)
  featureId: number;

  @Field(() => Int)
  testId: number;

  @Field(() => Int)
  testCaseId: number;

  @Field(() => Int)
  userId: number;

  @Field(() => User)
  user: User;

  @Field(() => TestCase, { nullable: true })
  testCase?: TestCase;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
