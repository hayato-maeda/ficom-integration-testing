'use client';

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

/**
 * Apollo Clientインスタンスの作成
 */
export const createApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: API_URL,
      credentials: 'include', // クッキーを含める
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
      },
      query: {
        fetchPolicy: 'network-only',
      },
    },
  });
};

/**
 * GraphQL Codegenで使用するfetcher関数
 */
export const fetcher = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit['headers'],
): (() => Promise<TData>) => {
  return async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      credentials: 'include',
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0] || { message: 'Unknown error' };
      throw new Error(message);
    }

    return json.data;
  };
};
