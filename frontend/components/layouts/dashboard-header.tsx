'use client';

import { Menu, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

/**
 * ダッシュボードヘッダーコンポーネント
 *
 * アプリケーション名、ユーザー情報、ログアウト機能を提供します。
 *
 * @param props - プロパティ
 * @param props.onMenuClick - メニューボタンクリック時のハンドラ（モバイル用）
 *
 * @example
 * ```tsx
 * <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
 * ```
 */
export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  // ログアウトハンドラー
  const handleLogout = async () => {
    await logout(); // バックエンドのセッションを破棄してCookieを削除
    router.push('/login');
  };

  // ユーザー名のイニシャルを取得
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* モバイルメニューボタン */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick} aria-label="メニューを開く">
          <Menu className="h-5 w-5" />
        </Button>

        {/* アプリケーション名 */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Test Case Management</h1>
        </div>

        <div className="flex-1" />

        {/* ユーザーメニュー */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user ? getUserInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>ログアウト</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
