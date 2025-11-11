import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { getIronSession } from 'iron-session';
import { getSessionConfig, SessionData } from '../config/session.config';
import type { Session } from '../decorators/session.decorator';

/**
 * セッションミドルウェア
 * すべてのリクエストにiron-sessionを適用します。
 * リクエストオブジェクトに session プロパティを追加します。
 */
@Injectable()
export class SessionMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // iron-sessionを初期化してリクエストに追加
    const sessionConfig = getSessionConfig();
    req.session = await getIronSession<SessionData>(req, res, sessionConfig);
    next();
  }
}

// Expressのリクエスト型を拡張してsessionプロパティを追加
declare module 'express' {
  interface Request {
    session: Session;
  }
}
