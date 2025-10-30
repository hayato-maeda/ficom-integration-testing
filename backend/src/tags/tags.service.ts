import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { TAGS_MESSAGES } from '../common/messages/tags.messages';
import { PrismaService } from '../prisma/prisma.service';
import { AssignTagInput } from './dto/assign-tag.input';
import { CreateTagInput } from './dto/create-tag.input';
import { TagAssignMutationResponse, TagMutationResponse } from './dto/tag-mutation.response';
import { UpdateTagInput } from './dto/update-tag.input';
import { Tag } from './models/tag.model';

/**
 * タグ管理サービス
 * タグのCRUD操作とテストケースへの割り当てを提供します。
 */
@Injectable()
export class TagsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(TagsService.name);
  }

  /**
   * タグを作成
   * @param createTagInput - 作成データ
   * @returns タグMutationレスポンス
   */
  async create(createTagInput: CreateTagInput): Promise<TagMutationResponse> {
    this.logger.info({ name: createTagInput.name }, 'Creating tag');

    // タグ名の重複チェック
    const existingTag = await this.prismaService.tag.findUnique({
      where: { name: createTagInput.name },
    });

    if (existingTag) {
      this.logger.warn({ name: createTagInput.name }, 'Tag name already exists');
      return {
        isValid: false,
        message: TAGS_MESSAGES.TAG_NAME_EXISTS(createTagInput.name),
        data: null,
      };
    }

    const tag = await this.prismaService.tag.create({
      data: {
        name: createTagInput.name,
        color: createTagInput.color,
      },
    });

    this.logger.info({ tagId: tag.id, name: tag.name }, 'Tag created successfully');

    return {
      isValid: true,
      message: TAGS_MESSAGES.TAG_CREATED,
      data: tag,
    };
  }

  /**
   * すべてのタグを取得
   * @returns タグの一覧
   */
  async findAll(): Promise<Tag[]> {
    this.logger.debug('Fetching all tags');

    const tags = await this.prismaService.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    this.logger.info({ count: tags.length }, 'Fetched all tags');

    return tags;
  }

  /**
   * 特定のタグを取得
   * @param id - タグID
   * @returns タグまたはnull
   */
  async findOne(id: number): Promise<Tag | null> {
    this.logger.debug({ tagId: id }, 'Fetching tag');

    const tag = await this.prismaService.tag.findUnique({
      where: { id },
    });

    return tag;
  }

  /**
   * タグを更新
   * @param updateTagInput - 更新データ
   * @returns タグMutationレスポンス
   */
  async update(updateTagInput: UpdateTagInput): Promise<TagMutationResponse> {
    this.logger.info({ tagId: updateTagInput.id }, 'Updating tag');

    // タグの存在確認
    const existingTag = await this.prismaService.tag.findUnique({
      where: { id: updateTagInput.id },
    });

    if (!existingTag) {
      this.logger.warn({ tagId: updateTagInput.id }, 'Tag not found for update');
      return {
        isValid: false,
        message: TAGS_MESSAGES.TAG_NOT_FOUND(updateTagInput.id),
        data: null,
      };
    }

    // タグ名の重複チェック（名前を変更する場合のみ）
    if (updateTagInput.name && updateTagInput.name !== existingTag.name) {
      const duplicateTag = await this.prismaService.tag.findUnique({
        where: { name: updateTagInput.name },
      });

      if (duplicateTag) {
        this.logger.warn({ name: updateTagInput.name }, 'Tag name already exists');
        return {
          isValid: false,
          message: TAGS_MESSAGES.TAG_NAME_EXISTS(updateTagInput.name),
          data: null,
        };
      }
    }

    // 更新データの準備
    const { id: _, ...updateFields } = updateTagInput;
    const updateData = Object.fromEntries(Object.entries(updateFields).filter(([, value]) => value !== undefined));

    const tag = await this.prismaService.tag.update({
      where: { id: updateTagInput.id },
      data: updateData,
    });

    this.logger.info({ tagId: tag.id }, 'Tag updated successfully');

    return {
      isValid: true,
      message: TAGS_MESSAGES.TAG_UPDATED,
      data: tag,
    };
  }

  /**
   * タグを削除
   * @param id - タグID
   * @returns タグMutationレスポンス
   */
  async remove(id: number): Promise<TagMutationResponse> {
    this.logger.info({ tagId: id }, 'Deleting tag');

    // タグの存在確認
    const existingTag = await this.prismaService.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      this.logger.warn({ tagId: id }, 'Tag not found for deletion');
      return {
        isValid: false,
        message: TAGS_MESSAGES.TAG_NOT_FOUND(id),
        data: null,
      };
    }

    await this.prismaService.tag.delete({
      where: { id },
    });

    this.logger.info({ tagId: id }, 'Tag deleted successfully');

    return {
      isValid: true,
      message: TAGS_MESSAGES.TAG_DELETED,
      data: existingTag,
    };
  }

  /**
   * テストケースにタグを割り当て
   * @param assignTagInput - 割り当てデータ
   * @returns タグ割り当てMutationレスポンス
   */
  async assignTag(assignTagInput: AssignTagInput): Promise<TagAssignMutationResponse> {
    this.logger.info(
      { testCaseId: assignTagInput.testCaseId, tagId: assignTagInput.tagId },
      'Assigning tag to test case',
    );

    // テストケースの存在確認
    const testCase = await this.prismaService.testCase.findUnique({
      where: { id: assignTagInput.testCaseId },
    });

    if (!testCase) {
      this.logger.warn({ testCaseId: assignTagInput.testCaseId }, 'Test case not found');
      return {
        isValid: false,
        message: TAGS_MESSAGES.TEST_CASE_NOT_FOUND(assignTagInput.testCaseId),
        data: null,
      };
    }

    // タグの存在確認
    const tag = await this.prismaService.tag.findUnique({
      where: { id: assignTagInput.tagId },
    });

    if (!tag) {
      this.logger.warn({ tagId: assignTagInput.tagId }, 'Tag not found');
      return {
        isValid: false,
        message: TAGS_MESSAGES.TAG_NOT_FOUND(assignTagInput.tagId),
        data: null,
      };
    }

    // 既に割り当て済みかチェック
    const existing = await this.prismaService.testCaseTag.findUnique({
      where: {
        testCaseId_tagId: {
          testCaseId: assignTagInput.testCaseId,
          tagId: assignTagInput.tagId,
        },
      },
    });

    if (existing) {
      this.logger.warn(
        { testCaseId: assignTagInput.testCaseId, tagId: assignTagInput.tagId },
        'Tag already assigned to test case',
      );
      return {
        isValid: false,
        message: TAGS_MESSAGES.TAG_ALREADY_ASSIGNED,
        data: null,
      };
    }

    await this.prismaService.testCaseTag.create({
      data: {
        testCaseId: assignTagInput.testCaseId,
        tagId: assignTagInput.tagId,
      },
    });

    this.logger.info(
      { testCaseId: assignTagInput.testCaseId, tagId: assignTagInput.tagId },
      'Tag assigned to test case successfully',
    );

    return {
      isValid: true,
      message: TAGS_MESSAGES.TAG_ASSIGNED,
      data: true,
    };
  }

  /**
   * テストケースからタグを削除
   * @param testCaseId - テストケースID
   * @param tagId - タグID
   * @returns タグ割り当てMutationレスポンス
   */
  async unassignTag(testCaseId: number, tagId: number): Promise<TagAssignMutationResponse> {
    this.logger.info({ testCaseId, tagId }, 'Unassigning tag from test case');

    // 割り当ての存在確認
    const existing = await this.prismaService.testCaseTag.findUnique({
      where: {
        testCaseId_tagId: {
          testCaseId,
          tagId,
        },
      },
    });

    if (!existing) {
      this.logger.warn({ testCaseId, tagId }, 'Tag assignment not found');
      return {
        isValid: false,
        message: TAGS_MESSAGES.TAG_NOT_ASSIGNED,
        data: null,
      };
    }

    await this.prismaService.testCaseTag.delete({
      where: {
        testCaseId_tagId: {
          testCaseId,
          tagId,
        },
      },
    });

    this.logger.info({ testCaseId, tagId }, 'Tag unassigned from test case successfully');

    return {
      isValid: true,
      message: TAGS_MESSAGES.TAG_UNASSIGNED,
      data: true,
    };
  }

  /**
   * テストケースに割り当てられているタグを取得
   * @param testCaseId - テストケースID
   * @returns タグの一覧
   */
  async getTagsByTestCase(testCaseId: number): Promise<Tag[]> {
    this.logger.debug({ testCaseId }, 'Fetching tags for test case');

    const testCaseTags = await this.prismaService.testCaseTag.findMany({
      where: { testCaseId },
      include: { tag: true },
    });

    const tags = testCaseTags.map((testCaseTag) => testCaseTag.tag);

    this.logger.debug({ testCaseId, count: tags.length }, 'Tags fetched for test case');

    return tags;
  }
}
