import { join } from 'node:path';
import type { Params } from 'nestjs-pino';

/**
 * Pino ロガー設定
 * 環境に応じて適切なログ形式を提供します
 */
export const pinoLoggerConfig = (): Params => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const logLevel = process.env.LOG_LEVEL || 'info';

  return {
    pinoHttp: {
      level: logLevel,
      // リクエストIDの自動生成
      genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
      // カスタムログレベル設定
      customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 500 || err) {
          return 'error';
        }
        if (res.statusCode >= 400) {
          return 'warn';
        }
        return 'info';
      },
      // カスタム成功メッセージ
      customSuccessMessage: (req, res) => {
        return `${req.method} ${req.url} - ${res.statusCode}`;
      },
      // カスタムエラーメッセージ
      customErrorMessage: (req, res, err) => {
        return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
      },
      // リクエスト/レスポンスのシリアライズ設定
      serializers: {
        req: (req) => ({
          id: req.id,
          method: req.method,
          url: req.url,
          // ヘッダーから機密情報を除外
          headers: {
            host: req.headers.host,
            'user-agent': req.headers['user-agent'],
            'content-type': req.headers['content-type'],
          },
          remoteAddress: req.remoteAddress,
          remotePort: req.remotePort,
        }),
        res: (res) => ({
          statusCode: res.statusCode,
        }),
      },
      // 全環境: pino-rollでファイル出力
      // 開発環境: pino-prettyも併用してコンソールを読みやすく
      transport: isDevelopment
        ? {
            targets: [
              // コンソール出力（Pretty print）
              {
                target: 'pino-pretty',
                level: logLevel,
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                  singleLine: false,
                  messageFormat: '{msg}',
                },
              },
              // ファイル出力（JSON + ローテーション）
              {
                target: 'pino-roll',
                level: logLevel,
                options: {
                  file: join(process.cwd(), 'logs', 'app'),
                  frequency: 'daily',
                  size: '10M',
                  retention: 30,
                  extension: '.log',
                  mkdir: true, // ディレクトリを自動作成
                },
              },
            ],
          }
        : {
            target: 'pino-roll',
            options: {
              // ログファイルの保存先
              file: join(process.cwd(), 'logs', 'app'),
              // ファイル名の日付フォーマット（YYYY-MM-DD）
              frequency: 'daily',
              // ファイルサイズによるローテーション（10MB）
              size: '10M',
              // 圧縮されたログファイルの保持期間（30日）
              retention: 30,
              // 拡張子
              extension: '.log',
              // ディレクトリを自動作成
              mkdir: true,
            },
          },
      // タイムスタンプを追加
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
    },
  };
};
