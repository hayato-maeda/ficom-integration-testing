'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FicomLoading } from '@/components/common';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 認証が必要なページを保護するコンポーネント
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <FicomLoading message="読み込み中..." />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
