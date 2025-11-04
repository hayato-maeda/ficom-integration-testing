'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth-context';

/**
 * 認証コンテキストを使用するためのカスタムフック
 *
 * @returns 認証コンテキストの値（user, isAuthenticated, login, signup, logout）
 * @throws AuthProvider外で使用された場合にエラーをスロー
 *
 * @example
 * ```tsx
 * const { user, login, logout } = useAuth();
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
