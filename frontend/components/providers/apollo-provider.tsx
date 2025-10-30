'use client';

import React from 'react';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { apolloClient } from '@/lib/apollo/apollo-client';

export const ApolloProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BaseApolloProvider client={apolloClient}>{children}</BaseApolloProvider>;
};
