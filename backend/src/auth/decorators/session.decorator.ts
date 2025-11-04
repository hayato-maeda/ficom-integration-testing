import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IronSession } from 'iron-session';
import { SessionData } from '../config/session.config';

/**
 * セッションデコレーター
 * GraphQLリゾルバーでiron-sessionを簡単に利用できるようにします。
 *
 * @example
 * ```typescript
 * @Mutation(() => AuthMutationResponse)
 * async login(
 *   @Args('loginInput') loginInput: LoginInput,
 *   @Session() session: IronSession<SessionData>
 * ): Promise<AuthMutationResponse> {
 *   // sessionを使用
 * }
 * ```
 */
export const Session = createParamDecorator((data: unknown, context: ExecutionContext): IronSession<SessionData> => {
  const ctx = GqlExecutionContext.create(context);
  const request = ctx.getContext().req;
  return request.session;
});
