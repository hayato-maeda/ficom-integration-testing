'use client';

import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink, Operation, FetchResult, Observable } from '@apollo/client';
import { GraphQLFormattedError } from 'graphql';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || 'http://localhost:4000/graphql',
});

// 認証トークンをヘッダーに追加するカスタムリンク
const authLink = new ApolloLink((operation: Operation, forward) => {
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
const errorLink = new ApolloLink((operation: Operation, forward) => {
  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: (result: FetchResult) => {
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

// Apollo Client インスタンスの作成
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
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
