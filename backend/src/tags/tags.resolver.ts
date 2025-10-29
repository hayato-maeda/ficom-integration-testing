import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { AssignTagInput } from './dto/assign-tag.input';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';
import { Tag } from './models/tag.model';
import { TagsService } from './tags.service';

/**
 * タグリゾルバー
 * GraphQL のタグ関連のクエリとミューテーションを処理します。
 */
@Resolver(() => Tag)
@UseGuards(GqlAuthGuard)
export class TagsResolver {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * タグ作成ミューテーション
   * @param createTagInput - 作成データ
   * @returns 作成されたタグ
   */
  @Mutation(() => Tag)
  async createTag(
    @Args('createTagInput', { type: () => CreateTagInput })
    createTagInput: CreateTagInput,
  ): Promise<Tag> {
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
   * @returns タグ
   */
  @Query(() => Tag)
  async tag(@Args('id', { type: () => Int }) id: number): Promise<Tag> {
    return this.tagsService.findOne(id);
  }

  /**
   * タグ更新ミューテーション
   * @param updateTagInput - 更新データ
   * @returns 更新されたタグ
   */
  @Mutation(() => Tag)
  async updateTag(
    @Args('updateTagInput', { type: () => UpdateTagInput })
    updateTagInput: UpdateTagInput,
  ): Promise<Tag> {
    return this.tagsService.update(updateTagInput);
  }

  /**
   * タグ削除ミューテーション
   * @param id - タグID
   * @returns 削除されたタグ
   */
  @Mutation(() => Tag)
  async deleteTag(@Args('id', { type: () => Int }) id: number): Promise<Tag> {
    return this.tagsService.remove(id);
  }

  /**
   * テストケースへのタグ割り当てミューテーション
   * @param assignTagInput - 割り当てデータ
   * @returns true（成功時）
   */
  @Mutation(() => Boolean)
  async assignTag(
    @Args('assignTagInput', { type: () => AssignTagInput })
    assignTagInput: AssignTagInput,
  ): Promise<boolean> {
    return this.tagsService.assignTag(assignTagInput);
  }

  /**
   * テストケースからのタグ削除ミューテーション
   * @param testCaseId - テストケースID
   * @param tagId - タグID
   * @returns true（成功時）
   */
  @Mutation(() => Boolean)
  async unassignTag(
    @Args('testCaseId', { type: () => Int }) testCaseId: number,
    @Args('tagId', { type: () => Int }) tagId: number,
  ): Promise<boolean> {
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
