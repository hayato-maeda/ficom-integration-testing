import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

/**
 * GraphQL セッション認証ガード
 * iron-sessionからJWTトークンを取得して検証を行います。
 * JwtStrategyを経由してトークンの署名検証、ブラックリストチェック、
 * tokenValidFromTimestampチェックなどを実行します。
 */
@Injectable()
export class GqlSessionGuard extends AuthGuard('jwt') {
  /**
   * GraphQL コンテキストからリクエストオブジェクトを取得
   * @param context - 実行コンテキスト
   * @returns リクエストオブジェクト
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
