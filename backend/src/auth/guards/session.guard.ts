import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * セッション認証ガード
 * iron-sessionからユーザー情報を取得して認証を行います。
 * JWTトークンの検証は行わず、セッションにユーザー情報があるかのみをチェックします。
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * セッションからユーザー情報を取得して認証
   * @param context - 実行コンテキスト
   * @returns 認証成功の場合true
   * @throws UnauthorizedException - セッションにユーザー情報がない場合
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // GraphQLコンテキストからリクエストを取得
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    // セッションからユーザー情報を取得
    const session = request.session;
    if (!session || !session.user) {
      throw new UnauthorizedException('セッションが見つかりません。ログインしてください。');
    }

    // セッションのユーザーIDを使用してデータベースから完全なユーザー情報を取得
    const user = await this.prismaService.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      throw new UnauthorizedException('ユーザーが見つかりません。');
    }

    // リクエストオブジェクトにユーザー情報を設定（CurrentUserデコレーターで使用）
    request.user = user;

    return true;
  }
}
