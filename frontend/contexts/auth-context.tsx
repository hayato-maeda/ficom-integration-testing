'use client';

import React, { createContext, useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { LOGIN_MUTATION, SIGNUP_MUTATION, LOGOUT_MUTATION, REFRESH_TOKEN_MUTATION } from '@/lib/graphql/auth';
import type { User, LoginInput, SignupInput, MutationResponse, AuthResponse } from '@/types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<MutationResponse<AuthResponse>>;
  signup: (input: SignupInput) => Promise<MutationResponse<AuthResponse>>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 認証機能を提供するContextプロバイダー
 *
 * アプリケーション全体で認証状態を管理し、ログイン・サインアップ・ログアウト・
 * トークンリフレッシュなどの認証関連機能を提供します。
 *
 * @param props - プロパティ
 * @param props.children - 子コンポーネント
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [loginMutation] = useMutation<{ login: MutationResponse<AuthResponse> }>(LOGIN_MUTATION);
  const [signupMutation] = useMutation<{ signUp: MutationResponse<AuthResponse> }>(SIGNUP_MUTATION);
  const [logoutMutation] = useMutation<{ logout: MutationResponse<null> }>(LOGOUT_MUTATION);
  const [refreshTokenMutation] = useMutation<{ refreshToken: MutationResponse<AuthResponse> }>(REFRESH_TOKEN_MUTATION);

  // トークン自動リフレッシュのスケジュール設定
  const scheduleTokenRefresh = (expiresAt: number) => {
    // 既存のタイマーをクリア
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // 有効期限の5分前にリフレッシュ
    const now = Date.now();
    const refreshTime = expiresAt - now - 5 * 60 * 1000;

    if (refreshTime > 0) {
      refreshTimerRef.current = setTimeout(() => refreshToken(), refreshTime);
    }
  };

  // トークンリフレッシュ実行関数
  const refreshToken = async () => {
    try {
      const result = await refreshTokenMutation();

      if (result.data?.refreshToken?.isValid && result.data.refreshToken.data) {
        const { user: userData, accessTokenExpiresAt: newExpiresAt } = result.data.refreshToken.data;
        setUser(userData);
        // 次のリフレッシュをスケジュール
        scheduleTokenRefresh(newExpiresAt);
      } else {
        // リフレッシュ失敗時はログアウト
        setUser(null);
        router.push('/login');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      setUser(null);
      router.push('/login');
    }
  };

  // ログイン
  const login = async (input: LoginInput): Promise<MutationResponse<AuthResponse>> => {
    try {
      const result = await loginMutation({ variables: input });

      if (result.data?.login?.isValid && result.data.login.data) {
        const { user: userData, accessTokenExpiresAt: expiresAt } = result.data.login.data;
        setUser(userData);
        scheduleTokenRefresh(expiresAt);
      }

      return result.data?.login || { isValid: false, message: 'ログインに失敗しました', data: null };
    } catch (error) {
      console.error('Login error:', error);
      return { isValid: false, message: 'ログインに失敗しました', data: null };
    }
  };

  // サインアップ
  const signup = async (input: SignupInput): Promise<MutationResponse<AuthResponse>> => {
    try {
      const result = await signupMutation({ variables: input });

      if (result.data?.signUp?.isValid && result.data.signUp.data) {
        const { user: userData, accessTokenExpiresAt: expiresAt } = result.data.signUp.data;
        setUser(userData);
        scheduleTokenRefresh(expiresAt);
      }

      return result.data?.signUp || { isValid: false, message: 'ユーザー登録に失敗しました', data: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { isValid: false, message: 'ユーザー登録に失敗しました', data: null };
    }
  };

  // ログアウト
  const logout = async () => {
    // タイマーをクリア
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    try {
      await logoutMutation();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // エラーが発生してもログアウト状態にする
      setUser(null);
      router.push('/login');
    }
  };

  // コンポーネントアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
