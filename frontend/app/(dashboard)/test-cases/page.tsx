import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

/**
 * テストケース一覧ページ
 *
 * テストケースの一覧を表示し、検索・フィルタリング・作成機能を提供します。
 * 次のステップでデータフェッチング機能を実装予定です。
 */
export default function TestCasesPage() {
  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">テストケース</h1>
          <p className="text-muted-foreground">テストケースの管理と実行</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </div>

      {/* テストケース一覧（仮表示） */}
      <Card>
        <CardHeader>
          <CardTitle>テストケース一覧</CardTitle>
          <CardDescription>登録されているテストケースの一覧です</CardDescription>
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
