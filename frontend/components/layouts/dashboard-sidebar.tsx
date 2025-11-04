'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ClipboardList, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const navigation = [
  {
    name: 'テストケース',
    href: '/test-cases',
    icon: ClipboardList,
  },
  {
    name: 'タグ',
    href: '/tags',
    icon: Tag,
  },
];

/**
 * ダッシュボードサイドバーコンポーネント
 *
 * ナビゲーションメニューを提供します。
 * モバイル表示では開閉可能なサイドバーとして動作します。
 *
 * @param props - プロパティ
 * @param props.open - サイドバーが開いているかどうか（モバイル用）
 * @param props.onClose - サイドバーを閉じるハンドラ（モバイル用）
 *
 * @example
 * ```tsx
 * <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
 * ```
 */
export function DashboardSidebar({ open = true, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* モバイル用オーバーレイ */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* サイドバー */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* モバイル用閉じるボタン */}
          <div className="flex h-16 items-center justify-between px-4 md:hidden">
            <span className="text-lg font-semibold">メニュー</span>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="メニューを閉じる">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* ナビゲーションリンク */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
