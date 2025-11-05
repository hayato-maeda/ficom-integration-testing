'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  GET_TEST_CASE_QUERY,
  GET_TEST_CASES_QUERY,
  DELETE_TEST_CASE_MUTATION,
} from '@/lib/graphql/test-cases';
import { MutationResponse, TestCase, TestCaseStatus } from '@/types';
import { ArrowLeft, Loader2, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { toast } from 'sonner';

/**
 * ステータスバッジのスタイルを取得
 */
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case TestCaseStatus.APPROVED:
      return 'default';
    case TestCaseStatus.IN_REVIEW:
      return 'secondary';
    case TestCaseStatus.REJECTED:
      return 'destructive';
    case TestCaseStatus.ARCHIVED:
      return 'outline';
    case TestCaseStatus.DRAFT:
    default:
      return 'outline';
  }
};

/**
 * ステータスの日本語表示名を取得
 */
const getStatusLabel = (status: string) => {
  switch (status) {
    case TestCaseStatus.DRAFT:
      return '下書き';
    case TestCaseStatus.IN_REVIEW:
      return 'レビュー中';
    case TestCaseStatus.APPROVED:
      return '承認済み';
    case TestCaseStatus.REJECTED:
      return '却下';
    case TestCaseStatus.ARCHIVED:
      return 'アーカイブ';
    default:
      return status;
  }
};

/**
 * テストケース詳細ページ
 *
 * テストケースの詳細情報を表示します。
 * 編集・削除機能を提供します。
 */
export default function TestCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, loading, error } = useQuery<{ testCase: TestCase | null }>(GET_TEST_CASE_QUERY, {
    variables: { id },
    skip: isNaN(id),
  });

  const [deleteTestCase, { loading: deleteLoading }] = useMutation<{
    deleteTestCase: MutationResponse<TestCase>;
  }>(DELETE_TEST_CASE_MUTATION, {
    refetchQueries: [{ query: GET_TEST_CASES_QUERY }],
  });

  const testCase = data?.testCase;

  const handleDelete = async () => {
    try {
      const result = await deleteTestCase({
        variables: { id },
      });

      if (result.data?.deleteTestCase.isValid) {
        toast.success('テストケースを削除しました', {
          id: 'delete-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        router.push('/test-cases');
      } else {
        toast.error(result.data?.deleteTestCase.message || '削除に失敗しました', {
          id: 'delete-error',
          style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
        });
      }
    } catch (error) {
      toast.error('エラーが発生しました', {
        id: 'delete-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (isNaN(id)) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/test-cases')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          テストケース一覧に戻る
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-destructive">無効なテストケースIDです</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/test-cases')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          テストケース一覧に戻る
        </Button>
        {testCase && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/test-cases/${id}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" />
              編集
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </Button>
          </div>
        )}
      </div>

      {/* ローディング状態 */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {/* エラー状態 */}
      {error && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-destructive">エラーが発生しました: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* テストケースが見つからない */}
      {!loading && !error && !testCase && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">テストケースが見つかりませんでした</p>
          </CardContent>
        </Card>
      )}

      {/* テストケース詳細 */}
      {!loading && !error && testCase && (
        <div className="space-y-6">
          {/* タイトルとステータス */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl">{testCase.title}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(testCase.status)}>
                      {getStatusLabel(testCase.status)}
                    </Badge>
                  </div>
                  <CardDescription>ID: {testCase.id}</CardDescription>
                </div>
              </div>
            </CardHeader>
            {testCase.description && (
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">説明</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{testCase.description}</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* テスト詳細 */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* テスト手順 */}
            <Card>
              <CardHeader>
                <CardTitle>テスト手順</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{testCase.steps}</p>
              </CardContent>
            </Card>

            {/* 期待結果 */}
            <Card>
              <CardHeader>
                <CardTitle>期待結果</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{testCase.expectedResult}</p>
              </CardContent>
            </Card>
          </div>

          {/* 実績結果 */}
          {testCase.actualResult && (
            <Card>
              <CardHeader>
                <CardTitle>実績結果</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{testCase.actualResult}</p>
              </CardContent>
            </Card>
          )}

          {/* タグと作成者情報 */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* タグ */}
            <Card>
              <CardHeader>
                <CardTitle>タグ</CardTitle>
              </CardHeader>
              <CardContent>
                {testCase.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {testCase.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">タグが設定されていません</p>
                )}
              </CardContent>
            </Card>

            {/* 作成者情報 */}
            <Card>
              <CardHeader>
                <CardTitle>作成者情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">作成者</p>
                  <p className="text-sm text-muted-foreground">{testCase.createdBy.name}</p>
                  <p className="text-sm text-muted-foreground">{testCase.createdBy.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">作成日</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(testCase.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">更新日</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(testCase.updatedAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>テストケースを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。テストケース「{testCase?.title}」を完全に削除します。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
