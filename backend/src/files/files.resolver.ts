import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { FilesService } from './files.service';
import { File } from './models/file.model';

/**
 * ファイルリゾルバー
 * GraphQL のファイル関連のクエリを処理します。
 */
@Resolver(() => File)
@UseGuards(GqlAuthGuard)
export class FilesResolver {
  constructor(private readonly filesService: FilesService) {}

  /**
   * ファイル一覧取得クエリ
   * @returns ファイルの一覧
   */
  @Query(() => [File])
  async files(): Promise<File[]> {
    return this.filesService.findAll();
  }

  /**
   * ファイル取得クエリ
   * @param id - ファイルID
   * @returns ファイル
   */
  @Query(() => File)
  async file(@Args('id', { type: () => Int }) id: number): Promise<File> {
    return this.filesService.findOne(id);
  }

  /**
   * テストケースに紐づくファイル一覧取得クエリ
   * @param testCaseId - テストケースID
   * @returns ファイルの一覧
   */
  @Query(() => [File])
  async filesByTestCase(@Args('testCaseId', { type: () => Int }) testCaseId: number): Promise<File[]> {
    return this.filesService.findByTestCase(testCaseId);
  }
}
