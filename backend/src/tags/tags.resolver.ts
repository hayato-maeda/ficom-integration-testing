import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlSessionGuard } from '../auth/guards/gql-session.guard';
import { AssignTagInput } from './dto/assign-tag.input';
import { CreateTagInput } from './dto/create-tag.input';
import { TagAssignMutationResponse, TagMutationResponse } from './dto/tag-mutation.response';
import { UpdateTagInput } from './dto/update-tag.input';
import { Tag } from './models/tag.model';
import { TagsService } from './tags.service';

/**
 * タグリゾルバー
 * GraphQL のタグ関連のクエリとミューテーションを処理します。
 */
@Resolver(() => Tag)
@UseGuards(GqlSessionGuard)
export class TagsResolver {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * タグ作成ミューテーション
   * @param createTagInput - 作成データ
   * @returns タグMutationレスポンス
   */
  @Mutation(() => TagMutationResponse)
  async createTag(
    @Args('createTagInput', { type: () => CreateTagInput })
    createTagInput: CreateTagInput,
  ): Promise<TagMutationResponse> {
    return this.tagsService.create(createTagInput);
  }

  /**
   * タグ一覧取得クエリ
   * @returns タグの一覧
   */
  @Query(() => [Tag])
  async tags(): Promise<Tag[]> {
    return this.tagsService.findAll();
  }

  /**
   * タグ取得クエリ
   * @param id - タグID
   * @returns タグまたはnull
   */
  @Query(() => Tag, { nullable: true })
  async tag(@Args('id', { type: () => Int }) id: number): Promise<Tag | null> {
    return this.tagsService.findOne(id);
  }

  /**
   * タグ更新ミューテーション
   * @param updateTagInput - 更新データ
   * @returns タグMutationレスポンス
   */
  @Mutation(() => TagMutationResponse)
  async updateTag(
    @Args('updateTagInput', { type: () => UpdateTagInput })
    updateTagInput: UpdateTagInput,
  ): Promise<TagMutationResponse> {
    return this.tagsService.update(updateTagInput);
  }

  /**
   * タグ削除ミューテーション
   * @param id - タグID
   * @returns タグMutationレスポンス
   */
  @Mutation(() => TagMutationResponse)
  async deleteTag(@Args('id', { type: () => Int }) id: number): Promise<TagMutationResponse> {
    return this.tagsService.remove(id);
  }

  /**
   * テストケースへのタグ割り当てミューテーション
   * @param assignTagInput - 割り当てデータ
   * @returns タグ割り当てMutationレスポンス
   */
  @Mutation(() => TagAssignMutationResponse)
  async assignTag(
    @Args('assignTagInput', { type: () => AssignTagInput })
    assignTagInput: AssignTagInput,
  ): Promise<TagAssignMutationResponse> {
    return this.tagsService.assignTag(assignTagInput);
  }

  /**
   * テストケースからのタグ削除ミューテーション
   * @param testCaseId - テストケースID
   * @param tagId - タグID
   * @returns タグ割り当てMutationレスポンス
   */
  @Mutation(() => TagAssignMutationResponse)
  async unassignTag(
    @Args('testCaseId', { type: () => Int }) testCaseId: number,
    @Args('tagId', { type: () => Int }) tagId: number,
  ): Promise<TagAssignMutationResponse> {
    return this.tagsService.unassignTag(testCaseId, tagId);
  }

  /**
   * テストケースに割り当てられているタグ取得クエリ
   * @param testCaseId - テストケースID
   * @returns タグの一覧
   */
  @Query(() => [Tag])
  async tagsByTestCase(@Args('testCaseId', { type: () => Int }) testCaseId: number): Promise<Tag[]> {
    return this.tagsService.getTagsByTestCase(testCaseId);
  }
}
