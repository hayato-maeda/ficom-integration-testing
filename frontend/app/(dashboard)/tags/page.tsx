import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

/**
 * タグ管理ページ
 *
 * タグの一覧を表示し、作成・編集・削除機能を提供します。
 * 次のステップでデータフェッチング機能を実装予定です。
 */
export default function TagsPage() {
  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">タグ管理</h1>
          <p className="text-muted-foreground">テストケースに割り当てるタグの管理</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </div>

      {/* タグ一覧（仮表示） */}
      <Card>
        <CardHeader>
          <CardTitle>タグ一覧</CardTitle>
          <CardDescription>登録されているタグの一覧です</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p>データフェッチング機能は次のステップで実装予定です</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
