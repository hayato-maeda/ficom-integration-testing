import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * 現在のユーザーデコレーター
 * GraphQL リゾルバーのパラメーターから認証済みユーザー情報を取得します。
 * @example
 * ```typescript
 * @Query(() => User)
 * @UseGuards(GqlAuthGuard)
 * async me(@CurrentUser() user: User) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext().req.user;
});
