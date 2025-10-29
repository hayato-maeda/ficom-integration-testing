'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function useLogout() {
  const { clearAuth } = useAuth();
  const router = useRouter();

  return () => {
    clearAuth();
    router.push('/login');
  };
}
