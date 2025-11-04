'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/layouts/auth-guard';
import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';

/**
 * ダッシュボードレイアウト
 *
 * ダッシュボード配下の全てのページで使用される共通レイアウトです。
 * ヘッダー、サイドバー、認証ガードを提供します。
 *
 * @param props - プロパティ
 * @param props.children - 子コンポーネント（ページコンテンツ）
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        {/* サイドバー */}
        <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* メインコンテンツエリア */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* ヘッダー */}
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

          {/* ページコンテンツ */}
          <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
