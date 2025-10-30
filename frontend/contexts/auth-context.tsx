'use client';

import React, { createContext, useContext, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { LOGIN_MUTATION, SIGNUP_MUTATION, REFRESH_TOKEN_MUTATION } from '@/lib/graphql/auth';
import type { User, LoginInput, SignupInput, MutationResponse, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<MutationResponse<AuthResponse>>;
  signup: (input: SignupInput) => Promise<MutationResponse<AuthResponse>>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const [loginMutation] = useMutation<{ login: MutationResponse<AuthResponse> }>(LOGIN_MUTATION);
  const [signupMutation] = useMutation<{ signUp: MutationResponse<AuthResponse> }>(SIGNUP_MUTATION);
  const [refreshTokenMutation] = useMutation<{ refreshToken: MutationResponse<AuthResponse> }>(REFRESH_TOKEN_MUTATION);

  // トークンリフレッシュ
  const refreshToken = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      return;
    }

    try {
      const { data } = await refreshTokenMutation({
        variables: { refreshToken: storedRefreshToken },
      });

      if (data?.refreshToken?.isValid && data.refreshToken.data) {
        const { accessToken, refreshToken: newRefreshToken, user: userData } = data.refreshToken.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        setUser(userData);
      } else {
        // トークンリフレッシュ失敗
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  // ログイン
  const login = async (input: LoginInput): Promise<MutationResponse<AuthResponse>> => {
    try {
      const { data } = await loginMutation({
        variables: input,
      });

      const response = data?.login;

      if (response?.isValid && response.data) {
        const { accessToken, refreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        // ページ遷移前にsetUserを呼ばないことでチラつきを防ぐ
      }

      return response || { isValid: false, message: 'ログインに失敗しました', data: null };
    } catch (error) {
      console.error('Login error:', error);
      return {
        isValid: false,
        message: 'ログインに失敗しました',
        data: null,
      };
    }
  };

  // サインアップ
  const signup = async (input: SignupInput): Promise<MutationResponse<AuthResponse>> => {
    try {
      const { data } = await signupMutation({
        variables: input,
      });

      const response = data?.signUp;

      if (response?.isValid && response.data) {
        const { accessToken, refreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        // ページ遷移前にsetUserを呼ばないことでチラつきを防ぐ
      }

      return response || { isValid: false, message: 'ユーザー登録に失敗しました', data: null };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        isValid: false,
        message: 'ユーザー登録に失敗しました',
        data: null,
      };
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
