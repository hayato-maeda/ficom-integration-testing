'use client';

import React, { createContext, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { LOGIN_MUTATION, SIGNUP_MUTATION, REFRESH_TOKEN_MUTATION } from '@/lib/graphql/auth';
import type { User, LoginInput, SignupInput, MutationResponse, AuthResponse } from '@/types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<MutationResponse<AuthResponse>>;
  signup: (input: SignupInput) => Promise<MutationResponse<AuthResponse>>;
  logout: () => void;
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

  const [loginMutation] = useMutation<{ login: MutationResponse<AuthResponse> }>(LOGIN_MUTATION);
  const [signupMutation] = useMutation<{ signUp: MutationResponse<AuthResponse> }>(SIGNUP_MUTATION);
  const [refreshTokenMutation] = useMutation<{ refreshToken: MutationResponse<AuthResponse> }>(REFRESH_TOKEN_MUTATION);

  // トークンリフレッシュ
  const refreshToken = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) return;

    await refreshTokenMutation({
      variables: { refreshToken: storedRefreshToken },
      onCompleted: (data) => {
        if (data?.refreshToken?.isValid && data.refreshToken.data) {
          const { accessToken, refreshToken: newRefreshToken, user: userData } = data.refreshToken.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          setUser(userData);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
        }
      },
      onError: (error) => {
        console.error('Token refresh failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      },
    });
  };

  // ログイン
  const login = async (input: LoginInput): Promise<MutationResponse<AuthResponse>> => {
    try {
      const result = await loginMutation({ variables: input });

      if (result.data?.login?.isValid && result.data.login.data) {
        const { accessToken, refreshToken } = result.data.login.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
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
        const { accessToken, refreshToken } = result.data.signUp.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }

      return result.data?.signUp || { isValid: false, message: 'ユーザー登録に失敗しました', data: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { isValid: false, message: 'ユーザー登録に失敗しました', data: null };
    }
  };

  // ログアウト
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/login');
  };

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
