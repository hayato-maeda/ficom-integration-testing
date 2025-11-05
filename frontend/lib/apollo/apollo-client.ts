'use client';

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable } from '@apollo/client';
import { GraphQLFormattedError } from 'graphql';

type Subscription = {
  unsubscribe: () => void;
};

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URI || 'http://localhost:4000/graphql';

// HTTPリンク(Cookie送信を有効化)
const httpLink = new HttpLink({
  uri: endpoint,
  credentials: 'include', // httpOnly Cookieを送信するために必要
});

// トークンリフレッシュ中のフラグとPromise
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * トークンをリフレッシュする関数
 */
const refreshAuthToken = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      query: `
        mutation RefreshToken {
          refreshToken {
            isValid
            message
          }
        }
      `,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      const isValid = data?.data?.refreshToken?.isValid;
      isRefreshing = false;
      refreshPromise = null;
      return isValid === true;
    })
    .catch((error) => {
      console.error('Token refresh failed:', error);
      isRefreshing = false;
      refreshPromise = null;
      return false;
    });

  return refreshPromise;
};

// リクエスト/レスポンスを監視し、401エラー時に自動リトライするカスタムリンク
const authRetryLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    let currentSubscription: Subscription | null = null;

    const handleResponse = (attemptNumber: number) => {
      currentSubscription = forward(operation).subscribe({
        next: async (result) => {
          // 認証エラーがある場合の処理
          const hasAuthError = result.errors?.some(
            (err: GraphQLFormattedError) => err.extensions?.code === 'UNAUTHENTICATED',
          );

          // MEクエリの場合は自動リトライをスキップ（認証確認用のクエリのため）
          const isNotMeQuery = operation.operationName !== 'Me';

          if (hasAuthError && attemptNumber === 1 && isNotMeQuery) {
            // 初回の認証エラー時: トークンをリフレッシュしてリトライ
            try {
              const refreshSuccess = await refreshAuthToken();

              if (refreshSuccess) {
                console.log('Token refreshed, retrying request...');
                // リフレッシュ成功: リクエストをリトライ
                if (currentSubscription) {
                  currentSubscription.unsubscribe();
                }
                handleResponse(2); // 2回目の試行
                return;
              } else {
                console.log('Token refresh failed, letting AuthGuard handle redirect');
              }
            } catch (error) {
              console.error('Error during token refresh:', error);
            }
          }

          // その他のエラーをログ出力
          if (result.errors) {
            result.errors.forEach((err: GraphQLFormattedError) => {
              if (err.extensions?.code !== 'UNAUTHENTICATED') {
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
    };

    handleResponse(1);

    return () => {
      if (currentSubscription) {
        currentSubscription.unsubscribe();
      }
    };
  });
});

/**
 * Apollo Clientのインスタンス
 *
 * GraphQLクエリとミューテーションを実行するための設定済みApollo Clientインスタンス。
 * 以下の機能が含まれます：
 * - セッションCookieによる認証（httpOnly Cookie）
 * - 401エラー時の自動リトライ（authRetryLink）
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
  link: ApolloLink.from([authRetryLink, httpLink]),
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
