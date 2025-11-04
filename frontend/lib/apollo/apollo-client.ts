'use client';

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable } from '@apollo/client';
import { GraphQLFormattedError } from 'graphql';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || 'http://localhost:4000/graphql',
  credentials: 'include', // Cookieを送信
});

// エラーハンドリングのカスタムリンク
const errorLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: (result) => {
        if (result.errors) {
          result.errors.forEach((err: GraphQLFormattedError) => {
            // 認証エラー（401 Unauthorized）の場合
            if (err.extensions?.code === 'UNAUTHENTICATED') {
              console.error('Authentication error:', err.message);
              // セッションCookieが期限切れの場合はログインページにリダイレクト
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
            } else {
              console.error(`[GraphQL error]: Message: ${err.message}`);
            }
          });
        }
        observer.next(result);
      },
      error: (networkError: Error) => {
        console.error(`[Network error]: ${networkError.message}`);
        observer.error(networkError);
      },
      complete: () => {
        observer.complete();
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  });
});

/**
 * Apollo Clientのインスタンス
 *
 * GraphQLクエリとミューテーションを実行するための設定済みApollo Clientインスタンス。
 * 以下の機能が含まれます：
 * - セッションCookieによる自動認証（credentials: 'include'）
 * - エラーハンドリング（errorLink）
 * - HTTPリクエスト（httpLink）
 * - インメモリキャッシュ
 *
 * @example
 * ```tsx
 * import { apolloClient } from '@/lib/apollo/apollo-client';
 *
 * const { data } = await apolloClient.query({
 *   query: GET_USER_QUERY,
 * });
 * ```
 */
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
