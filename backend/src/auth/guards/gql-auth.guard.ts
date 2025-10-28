import { type ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

/**
 * GraphQL 認証ガード
 * GraphQL リクエストに対する JWT 認証を行います。
 * 通常の REST API とは異なり、GraphQL のコンテキストから
 * リクエストオブジェクトを取得します。
 */
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {

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
