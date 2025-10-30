import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../users/models/user.model';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
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
   * @returns 認証Mutationレスポンス
   */
  @Mutation(() => AuthMutationResponse)
  async signUp(
    @Args('signUpInput', { type: () => SignUpInput }) signUpInput: SignUpInput,
  ): Promise<AuthMutationResponse> {
    return this.authService.signUp(signUpInput);
  }

  /**
   * ログインミューテーション
   * ユーザーをログインさせます。
   * @param loginInput - ログイン入力データ
   * @returns 認証Mutationレスポンス
   */
  @Mutation(() => AuthMutationResponse)
  async login(@Args('loginInput', { type: () => LoginInput }) loginInput: LoginInput): Promise<AuthMutationResponse> {
    return this.authService.login(loginInput);
  }

  /**
   * リフレッシュトークンミューテーション
   * リフレッシュトークンを使用して新しいアクセストークンを取得します。
   * @param refreshTokenInput - リフレッシュトークン入力データ
   * @returns 認証Mutationレスポンス
   */
  @Mutation(() => AuthMutationResponse)
  async refreshToken(
    @Args('refreshTokenInput', { type: () => RefreshTokenInput })
    refreshTokenInput: RefreshTokenInput,
  ): Promise<AuthMutationResponse> {
    return this.authService.refreshAccessToken(refreshTokenInput.refreshToken, refreshTokenInput.oldAccessToken);
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
