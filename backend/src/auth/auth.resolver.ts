import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../users/models/user.model';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponse } from './dto/auth.response';
import { LoginInput } from './dto/login.input';
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
   * @returns 認証レスポンス（JWT トークンとユーザー情報）
   */
  @Mutation(() => AuthResponse)
  async signUp(
    @Args('signUpInput', { type: () => SignUpInput }) signUpInput: SignUpInput,
  ): Promise<AuthResponse> {
    return this.authService.signUp(signUpInput);
  }

  /**
   * ログインミューテーション
   * ユーザーをログインさせます。
   * @param loginInput - ログイン入力データ
   * @returns 認証レスポンス（JWT トークンとユーザー情報）
   */
  @Mutation(() => AuthResponse)
  async login(
    @Args('loginInput', { type: () => LoginInput }) loginInput: LoginInput,
  ): Promise<AuthResponse> {
    return this.authService.login(loginInput);
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
    console.log('Current User:', user);
    return user;
  }
}
