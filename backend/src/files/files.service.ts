import { join } from 'node:path';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import type { File } from './models/file.model';

/**
 * ファイルサービス
 * ファイルのアップロード、取得、削除機能を提供します。
 */
@Injectable()
export class FilesService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor(
    private readonly prismaService: PrismaService,
    @InjectPinoLogger(FilesService.name)
    private readonly logger: PinoLogger,
  ) {}

  /**
   * ファイル情報をデータベースに保存
   * @param filename - ファイル名
   * @param path - ファイルパス
   * @param mimeType - MIMEタイプ
   * @param size - ファイルサイズ
   * @param featureId - 機能ID
   * @param testId - テストID（機能内での連番）
   * @param testCaseId - テストケースID（テスト内での連番）
   * @param uploadedBy - アップロードユーザーID
   * @returns 保存されたファイル情報
   */
  async create(
    filename: string,
    path: string,
    mimeType: string,
    size: number,
    featureId: number,
    testId: number,
    testCaseId: number,
    uploadedBy: number,
  ): Promise<File> {
    this.logger.info(
      {
        filename,
        path,
        mimeType,
        size,
        featureId,
        testId,
        testCaseId,
        uploadedBy,
      },
      'Creating file record',
    );

    const file = await this.prismaService.file.create({
      data: {
        filename,
        path,
        mimeType,
        size,
        featureId,
        testId,
        testCaseId,
        uploadedBy,
      },
      include: {
        testCase: {
          include: {
            createdBy: true,
          },
        },
        uploader: true,
      },
    });

    this.logger.info({ fileId: file.id }, 'File record created successfully');

    return file;
  }

  /**
   * ファイル一覧取得
   * @returns ファイルの一覧
   */
  async findAll(): Promise<File[]> {
    this.logger.info('Fetching all files');

    return this.prismaService.file.findMany({
      include: {
        testCase: {
          include: {
            createdBy: true,
          },
        },
        uploader: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * ファイル取得
   * @param id - ファイルID
   * @returns ファイル
   * @throws NotFoundException - ファイルが存在しない場合
   */
  async findOne(id: number): Promise<File> {
    this.logger.info({ fileId: id }, 'Fetching file');

    const file = await this.prismaService.file.findUnique({
      where: { id },
      include: {
        testCase: {
          include: {
            createdBy: true,
          },
        },
        uploader: true,
      },
    });

    if (!file) {
      this.logger.warn({ fileId: id }, 'File not found');
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  /**
   * テストケースに紐づくファイル一覧取得
   * @param featureId - 機能ID
   * @param testId - テストID（機能内での連番）
   * @param testCaseId - テストケースID（テスト内での連番）
   * @returns ファイルの一覧
   */
  async findByTestCase(featureId: number, testId: number, testCaseId: number): Promise<File[]> {
    this.logger.info({ featureId, testId, testCaseId }, 'Fetching files for test case');

    return this.prismaService.file.findMany({
      where: {
        featureId,
        testId,
        testCaseId,
      },
      include: {
        testCase: {
          include: {
            createdBy: true,
          },
        },
        uploader: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * ファイル削除
   * @param id - ファイルID
   * @returns 削除されたファイル
   * @throws NotFoundException - ファイルが存在しない場合
   */
  async remove(id: number): Promise<File> {
    this.logger.info({ fileId: id }, 'Deleting file');

    const existingFile = await this.prismaService.file.findUnique({
      where: { id },
    });

    if (!existingFile) {
      this.logger.warn({ fileId: id }, 'File not found for deletion');
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    const file = await this.prismaService.file.delete({
      where: { id },
      include: {
        testCase: {
          include: {
            createdBy: true,
          },
        },
        uploader: true,
      },
    });

    this.logger.info({ fileId: id }, 'File deleted successfully');

    return file;
  }

  /**
   * ファイルの物理パスを取得
   * @param id - ファイルID
   * @returns ファイルの絶対パス
   */
  async getFilePath(id: number): Promise<string> {
    const file = await this.findOne(id);
    return join(this.uploadDir, file.path);
  }
}
