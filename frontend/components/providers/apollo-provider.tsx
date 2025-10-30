'use client';

import React from 'react';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { apolloClient } from '@/lib/apollo/apollo-client';

/**
 * Apollo Clientプロバイダーコンポーネント
 *
 * 設定済みのApollo Clientインスタンスを提供し、
 * 子コンポーネントでGraphQLクエリとミューテーションを使用可能にします。
 *
 * @param props - プロパティ
 * @param props.children - 子コンポーネント
 *
 * @example
 * ```tsx
 * <ApolloProvider>
 *   <App />
 * </ApolloProvider>
 * ```
 */
export const ApolloProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BaseApolloProvider client={apolloClient}>{children}</BaseApolloProvider>;
};
