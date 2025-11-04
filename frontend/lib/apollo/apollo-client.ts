'use client';

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable } from '@apollo/client';
import { GraphQLFormattedError } from 'graphql';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || 'http://localhost:4000/graphql',
});

// 認証トークンをヘッダーに追加するカスタムリンク
const authLink = new ApolloLink((operation, forward) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }));

  return forward(operation);
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
              const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

              if (refreshToken) {
                // トークンリフレッシュのロジックはAuthContextで処理
                console.error('Authentication error:', err.message);
              } else {
                // リフレッシュトークンがない場合はログインページにリダイレクト
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  window.location.href = '/login';
                }
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
 * GraphQLクエリとミューテーションを実行するための設定済みApollo Clientインスタンス
 * 以下の機能が含まれます：
 * - 認証トークンの自動付与（authLink）
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
  link: ApolloLink.from([errorLink, authLink, httpLink]),
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
