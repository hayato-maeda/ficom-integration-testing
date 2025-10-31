'use client';

import React from 'react';
import { ApolloProvider } from './apollo-provider';
import { AuthProvider } from '@/contexts/auth-context';

/**
 * アプリケーション全体のプロバイダーを統合するコンポーネント
 *
 * Apollo ClientとAuthenticationの両方のプロバイダーを提供し、
 * アプリケーション全体でGraphQLクエリと認証機能を使用可能にします。
 *
 * @param props - プロパティ
 * @param props.children - 子コンポーネント
 *
 * @example
 * ```tsx
 * <Providers>
 *   <App />
 * </Providers>
 * ```
 */
export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ApolloProvider>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
};
