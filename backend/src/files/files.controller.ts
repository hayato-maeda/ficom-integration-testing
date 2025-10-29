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
   * @param user - 現在のユーザー
   * @returns アップロードされたファイル情報
   */
  @Post('upload/:testCaseId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          const filename = `${file.originalname.replace(ext, '')}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB制限
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('testCaseId', ParseIntPipe) testCaseId: number,
    @CurrentUser() user: User,
  ): Promise<File> {
    this.logger.info(
      {
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        testCaseId,
        userId: user.id,
      },
      'File upload initiated',
    );

    const uploadedFile = await this.filesService.create(
      file.originalname,
      file.filename,
      file.mimetype,
      file.size,
      testCaseId,
      user.id,
    );

    this.logger.info({ fileId: uploadedFile.id }, 'File uploaded successfully');

    return uploadedFile;
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

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);

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
