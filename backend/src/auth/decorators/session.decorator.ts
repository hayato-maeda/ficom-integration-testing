import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IronSession } from 'iron-session';
import { SessionData } from '../config/session.config';

/**
 * セッション型エイリアス
 * Sessionの型を簡潔に記述するためのエイリアス
 */
export type Session = IronSession<SessionData>;

/**
 * セッションデコレーター
 * GraphQLリゾルバーでiron-sessionを簡単に利用できるようにします。
 *
 * @example
 * ```typescript
 * @Mutation(() => AuthMutationResponse)
 * async login(
 *   @Args('loginInput') loginInput: LoginInput,
 *   @Session() session: Session
 * ): Promise<AuthMutationResponse> {
 *   // sessionを使用
 * }
 * ```
 */
export const Session = createParamDecorator((_data: unknown, context: ExecutionContext): Session => {
  const ctx = GqlExecutionContext.create(context);
  const request = ctx.getContext().req;
  return request.session;
});
