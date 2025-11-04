'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

/**
 * 認証ガードコンポーネント
 *
 * ログインしていないユーザーをログインページにリダイレクトします。
 * ダッシュボード配下のページで使用されます。
 *
 * @param props - プロパティ
 * @param props.children - 子コンポーネント
 *
 * @example
 * ```tsx
 * <AuthGuard>
 *   <DashboardContent />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // 認証されていない場合は何も表示しない（リダイレクト中）
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
