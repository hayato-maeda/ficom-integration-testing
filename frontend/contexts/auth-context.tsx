'use client';

import React, { createContext, useState, useEffect, useRef } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client/react';
import { LOGIN_MUTATION, SIGNUP_MUTATION, ME_QUERY } from '@/lib/graphql/auth';
import type { User, LoginInput, SignupInput, MutationResponse, AuthResponse } from '@/types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<MutationResponse<AuthResponse>>;
  signup: (input: SignupInput) => Promise<MutationResponse<AuthResponse>>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 認証機能を提供するContextプロバイダー
 *
 * アプリケーション全体で認証状態を管理し、ログイン・サインアップ・ログアウト
 * などの認証関連機能を提供します。
 * トークンリフレッシュは Apollo Client の authRetryLink が自動的に処理します。
 * リロード時には ME_QUERY でユーザー情報を自動取得します。
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
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const [loginMutation] = useMutation<{ login: MutationResponse<AuthResponse> }>(LOGIN_MUTATION);
  const [signupMutation] = useMutation<{ signUp: MutationResponse<AuthResponse> }>(SIGNUP_MUTATION);
  const [fetchMe] = useLazyQuery<{ me: { user: User } }>(ME_QUERY, {
    fetchPolicy: 'network-only',
  });

  // 初期化時にユーザー情報を取得（1回のみ）
  useEffect(() => {
    // 既に初期化済みの場合はスキップ
    if (initialized.current) {
      console.log('[AuthProvider] Already initialized, skipping');
      return;
    }

    const initializeAuth = async () => {
      try {
        const { data } = await fetchMe();
        if (data?.me) {
          setUser(data.me.user);
        } else {
          console.log('[AuthProvider] No user data');
        }
      } catch {
        console.log('[AuthProvider] Not authenticated');
      } finally {
        setIsLoading(false);
        initialized.current = true;
        console.log('[AuthProvider] Initialization complete');
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ログイン
  const login = async (input: LoginInput): Promise<MutationResponse<AuthResponse>> => {
    try {
      const result = await loginMutation({ variables: input });

      if (result.data?.login?.isValid && result.data.login.data) {
        const { user: userData } = result.data.login.data;
        setUser(userData);
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
        const { user: userData } = result.data.signUp.data;
        setUser(userData);
      }

      return result.data?.signUp || { isValid: false, message: 'ユーザー登録に失敗しました', data: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { isValid: false, message: 'ユーザー登録に失敗しました', data: null };
    }
  };

  // ログアウト（リダイレクトは呼び出し側で行う）
  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
