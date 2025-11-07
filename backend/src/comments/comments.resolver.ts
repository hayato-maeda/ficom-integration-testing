import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './models/comment.model';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { CommentMutationResponse } from './dto/comment-mutation.response';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';

@Resolver(() => Comment)
@UseGuards(GqlAuthGuard)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * コメントを作成
   */
  @Mutation(() => CommentMutationResponse)
  async createComment(
    @CurrentUser() currentUser: User,
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
  ): Promise<CommentMutationResponse> {
    try {
      const comment = await this.commentsService.create(currentUser.id, createCommentInput);
      return {
        isValid: true,
        message: 'Comment created successfully',
        data: comment,
      };
    } catch (error) {
      return {
        isValid: false,
        message: error.message || 'Failed to create comment',
        data: null,
      };
    }
  }

  /**
   * TestCaseに紐づくコメント一覧を取得
   */
  @Query(() => [Comment])
  async commentsByTestCase(
    @Args('featureId', { type: () => Int }) featureId: number,
    @Args('testId', { type: () => Int }) testId: number,
    @Args('testCaseId', { type: () => Int }) testCaseId: number,
  ): Promise<Comment[]> {
    return this.commentsService.findByTestCase(featureId, testId, testCaseId);
  }

  /**
   * コメントを1件取得
   */
  @Query(() => Comment)
  async comment(@Args('id', { type: () => Int }) id: number): Promise<Comment> {
    return this.commentsService.findOne(id);
  }

  /**
   * コメントを更新
   */
  @Mutation(() => CommentMutationResponse)
  async updateComment(
    @CurrentUser() currentUser: User,
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
  ): Promise<CommentMutationResponse> {
    try {
      const comment = await this.commentsService.update(currentUser.id, updateCommentInput);
      return {
        isValid: true,
        message: 'Comment updated successfully',
        data: comment,
      };
    } catch (error) {
      return {
        isValid: false,
        message: error.message || 'Failed to update comment',
        data: null,
      };
    }
  }

  /**
   * コメントを削除
   */
  @Mutation(() => CommentMutationResponse)
  async deleteComment(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CommentMutationResponse> {
    try {
      await this.commentsService.remove(id, currentUser.id);
      return {
        isValid: true,
        message: 'Comment deleted successfully',
        data: null,
      };
    } catch (error) {
      return {
        isValid: false,
        message: error.message || 'Failed to delete comment',
        data: null,
      };
    }
  }
}
