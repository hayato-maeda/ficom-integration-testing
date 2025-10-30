'use client';

import React from 'react';
import { ApolloProvider } from './apollo-provider';
import { AuthProvider } from '@/contexts/auth-context';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ApolloProvider>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
};
