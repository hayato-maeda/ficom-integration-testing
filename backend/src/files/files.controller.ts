import { randomUUID } from 'node:crypto';
import { extname, join } from 'node:path';
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/models/user.model';
import { FilesService } from './files.service';
import type { File } from './models/file.model';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * ファイルコントローラー
 * ファイルのアップロード、ダウンロード機能を提供します。
 */
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    @InjectPinoLogger(FilesController.name)
    private readonly logger: PinoLogger,
  ) {}

  /**
   * ファイルアップロード
   * @param file - アップロードされたファイル
   * @param featureId - 機能ID
   * @param testId - テストID
   * @param testCaseId - テストケースID
   * @param user - 現在のユーザー
   * @returns アップロードされたファイル情報
   */
  @Post('upload/:featureId/:testId/:testCaseId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, callback) => {
          // ファイル名をUTF-8で正しくデコード
          const originalFilename = Buffer.from(file.originalname, 'latin1').toString('utf8');
          const uuid = randomUUID();
          const ext = extname(originalFilename);
          const filename = `${originalFilename.replace(ext, '')}-${uuid}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('featureId', ParseIntPipe) featureId: number,
    @Param('testId', ParseIntPipe) testId: number,
    @Param('testCaseId', ParseIntPipe) testCaseId: number,
    @CurrentUser() user: User,
  ): Promise<File> {
    // ファイル名をUTF-8で正しくデコード
    const originalFilename = Buffer.from(file.originalname, 'latin1').toString('utf8');

    this.logger.info(
      {
        filename: originalFilename,
        size: file.size,
        mimeType: file.mimetype,
        featureId,
        testId,
        testCaseId,
        userId: user.id,
      },
      'File upload initiated',
    );

    const uploadedFile = await this.filesService.create(
      originalFilename,
      file.filename,
      file.mimetype,
      file.size,
      featureId,
      testId,
      testCaseId,
      user.id,
    );

    this.logger.info({ fileId: uploadedFile.id }, 'File uploaded successfully');

    return uploadedFile;
  }

  /**
   * ファイル表示（プレビュー用）
   * @param id - ファイルID
   * @param res - Expressレスポンスオブジェクト
   */
  @Get(':id/view')
  async viewFile(@Param('id', ParseIntPipe) id: number, @Res() res: Response): Promise<void> {
    this.logger.info({ fileId: id }, 'File view requested');

    const file = await this.filesService.findOne(id);
    const filePath = await this.filesService.getFilePath(id);

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    this.logger.info({ fileId: id, filename: file.filename }, 'Sending file for view');

    res.sendFile(filePath);
  }

  /**
   * ファイルダウンロード
   * @param id - ファイルID
   * @param res - Expressレスポンスオブジェクト
   */
  @Get(':id/download')
  async downloadFile(@Param('id', ParseIntPipe) id: number, @Res() res: Response): Promise<void> {
    this.logger.info({ fileId: id }, 'File download requested');

    const file = await this.filesService.findOne(id);
    const filePath = await this.filesService.getFilePath(id);

    // 日本語ファイル名をRFC 5987形式でエンコード
    const encodedFilename = encodeURIComponent(file.filename);

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);

    this.logger.info({ fileId: id, filename: file.filename }, 'Sending file for download');

    res.sendFile(filePath);
  }

  /**
   * ファイル削除
   * @param id - ファイルID
   * @returns 削除されたファイル情報
   */
  @Delete(':id')
  async deleteFile(@Param('id', ParseIntPipe) id: number): Promise<File> {
    this.logger.info({ fileId: id }, 'File deletion requested');

    const deletedFile = await this.filesService.remove(id);

    this.logger.info({ fileId: id }, 'File deleted successfully');

    return deletedFile;
  }
}
