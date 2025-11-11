import { Field, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { Comment } from '../models/comment.model';

@ObjectType()
export class CommentMutationResponse extends BaseResponse {
  @Field(() => Comment, { nullable: true })
  data: Comment | null;
}
