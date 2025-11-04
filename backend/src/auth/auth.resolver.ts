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
import { SignUpInput } from './dto/signup.input';
import { GqlSessionGuard } from './guards/gql-session.guard';

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
      await session.save();

      // クライアントにはトークンを返さない（セッションCookieで管理）
      // ただし、有効期限はクライアント側で事前チェックできるように返す
      return {
        isValid: result.isValid,
        message: result.message,
        data: {
          user: result.data.user,
          accessTokenExpiresAt: session.accessTokenExpiresAt,
        },
      };
    }

    // 失敗時
    return {
      isValid: result.isValid,
      message: result.message,
      data: null,
    };
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
      await session.save();

      // クライアントにはトークンを返さない（セッションCookieで管理）
      // ただし、有効期限はクライアント側で事前チェックできるように返す
      return {
        isValid: result.isValid,
        message: result.message,
        data: {
          user: result.data.user,
          accessTokenExpiresAt: session.accessTokenExpiresAt,
        },
      };
    }

    // 失敗時
    return {
      isValid: result.isValid,
      message: result.message,
      data: null,
    };
  }

  /**
   * リフレッシュトークンミューテーション
   * セッションCookieからリフレッシュトークンとアクセストークンを取得して、
   * 新しいアクセストークンを発行します。
   * @param session - セッション
   * @returns 認証Mutationレスポンス
   */
  @Mutation(() => AuthMutationResponse)
  async refreshToken(@Session() session: IronSession<SessionData>): Promise<AuthMutationResponse> {
    // セッションからリフレッシュトークンを取得
    const refreshToken = session.refreshToken;

    if (!refreshToken) {
      return {
        isValid: false,
        message: 'セッションにトークンが見つかりません。再度ログインしてください。',
        data: null,
      };
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    // トークンリフレッシュ成功時にセッションを更新
    if (result.isValid && result.data) {
      session.accessToken = result.data.accessToken;
      session.refreshToken = result.data.refreshToken;
      session.accessTokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1時間後
      await session.save();

      // クライアントにはトークンを返さない（セッションCookieで管理）
      // ただし、有効期限はクライアント側で事前チェックできるように返す
      return {
        isValid: result.isValid,
        message: result.message,
        data: {
          user: result.data.user,
          accessTokenExpiresAt: session.accessTokenExpiresAt,
        },
      };
    }

    // 失敗時
    return {
      isValid: result.isValid,
      message: result.message,
      data: null,
    };
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
   * セッションから現在ログイン中のユーザー情報を取得します。
   * @param user - 認証済みユーザー（セッションから自動注入）
   * @returns ユーザー情報
   */
  @Query(() => User)
  @UseGuards(GqlSessionGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
