import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { IronSession } from 'iron-session';
import { User } from '../users/models/user.model';
import { AuthService } from './auth.service';
import type { SessionData } from './config/session.config';
import { CurrentUser } from './decorators/current-user.decorator';
import { Session } from './decorators/session.decorator';
import { AuthMutationResponse } from './dto/auth-mutation.response';
import { LoginInput } from './dto/login.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { SignUpInput } from './dto/signup.input';
import { GqlAuthGuard } from './guards/gql-auth.guard';

/**
 * 認証リゾルバー
 * GraphQL の認証関連のクエリとミューテーションを処理します。
 */
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * サインアップミューテーション
   * 新規ユーザーを登録します。
   * @param signUpInput - サインアップ入力データ
   * @param session - セッション
   * @returns 認証Mutationレスポンス
   */
  @Mutation(() => AuthMutationResponse)
  async signUp(
    @Args('signUpInput', { type: () => SignUpInput }) signUpInput: SignUpInput,
    @Session() session: IronSession<SessionData>,
  ): Promise<AuthMutationResponse> {
    const result = await this.authService.signUp(signUpInput);

    // サインアップ成功時にセッションに保存
    if (result.isValid && result.data) {
      session.accessToken = result.data.accessToken;
      session.refreshToken = result.data.refreshToken;
      session.accessTokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1時間後
      session.user = {
        id: result.data.user.id,
        email: result.data.user.email,
        name: result.data.user.name,
        role: result.data.user.role,
      };
      await session.save();
    }

    return result;
  }

  /**
   * ログインミューテーション
   * ユーザーをログインさせます。
   * @param loginInput - ログイン入力データ
   * @param session - セッション
   * @returns 認証Mutationレスポンス
   */
  @Mutation(() => AuthMutationResponse)
  async login(
    @Args('loginInput', { type: () => LoginInput }) loginInput: LoginInput,
    @Session() session: IronSession<SessionData>,
  ): Promise<AuthMutationResponse> {
    const result = await this.authService.login(loginInput);

    // ログイン成功時にセッションに保存
    if (result.isValid && result.data) {
      session.accessToken = result.data.accessToken;
      session.refreshToken = result.data.refreshToken;
      session.accessTokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1時間後
      session.user = {
        id: result.data.user.id,
        email: result.data.user.email,
        name: result.data.user.name,
        role: result.data.user.role,
      };
      await session.save();
    }

    return result;
  }

  /**
   * リフレッシュトークンミューテーション
   * リフレッシュトークンを使用して新しいアクセストークンを取得します。
   * @param refreshTokenInput - リフレッシュトークン入力データ
   * @param session - セッション
   * @returns 認証Mutationレスポンス
   */
  @Mutation(() => AuthMutationResponse)
  async refreshToken(
    @Args('refreshTokenInput', { type: () => RefreshTokenInput })
    refreshTokenInput: RefreshTokenInput,
    @Session() session: IronSession<SessionData>,
  ): Promise<AuthMutationResponse> {
    const result = await this.authService.refreshAccessToken(refreshTokenInput.refreshToken, refreshTokenInput.oldAccessToken);

    // トークンリフレッシュ成功時にセッションを更新
    if (result.isValid && result.data) {
      session.accessToken = result.data.accessToken;
      session.refreshToken = result.data.refreshToken;
      session.accessTokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1時間後
      session.user = {
        id: result.data.user.id,
        email: result.data.user.email,
        name: result.data.user.name,
        role: result.data.user.role,
      };
      await session.save();
    }

    return result;
  }

  /**
   * ログアウトミューテーション
   * セッションを破棄してユーザーをログアウトさせます。
   * @param session - セッション
   * @returns 成功メッセージ
   */
  @Mutation(() => AuthMutationResponse)
  async logout(@Session() session: IronSession<SessionData>): Promise<AuthMutationResponse> {
    // セッションを破棄
    session.destroy();

    return {
      isValid: true,
      message: 'ログアウトしました',
      data: null,
    };
  }

  /**
   * 現在のユーザー取得クエリ
   * JWT トークンから現在ログイン中のユーザー情報を取得します。
   * @param user - 認証済みユーザー（デコレーターから自動注入）
   * @returns ユーザー情報
   */
  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
