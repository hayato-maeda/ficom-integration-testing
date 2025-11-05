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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GET_TEST_CASE_QUERY,
  GET_TEST_CASES_QUERY,
  DELETE_TEST_CASE_MUTATION,
} from '@/lib/graphql/test-cases';
import {
  GET_FEATURES_QUERY,
  ASSIGN_FEATURE_MUTATION,
  UNASSIGN_FEATURE_MUTATION,
} from '@/lib/graphql/features';
import { MutationResponse, TestCase, TestCaseStatus, Feature, FeatureStatus } from '@/types';
import { ArrowLeft, Loader2, Pencil, Trash2, Plus, X } from 'lucide-react';
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
 * 機能ステータスバッジのスタイルを取得
 */
const getFeatureStatusBadgeVariant = (status: string) => {
  switch (status) {
    case FeatureStatus.COMPLETED:
      return 'default';
    case FeatureStatus.DEVELOPING:
      return 'secondary';
    case FeatureStatus.TESTING:
      return 'secondary';
    case FeatureStatus.ON_HOLD:
      return 'outline';
    case FeatureStatus.PLANNING:
    default:
      return 'outline';
  }
};

/**
 * 機能ステータスの日本語表示名を取得
 */
const getFeatureStatusLabel = (status: string) => {
  switch (status) {
    case FeatureStatus.PLANNING:
      return '計画中';
    case FeatureStatus.DEVELOPING:
      return '開発中';
    case FeatureStatus.TESTING:
      return 'テスト中';
    case FeatureStatus.COMPLETED:
      return '完了';
    case FeatureStatus.ON_HOLD:
      return '保留';
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
  const [addFeatureDialogOpen, setAddFeatureDialogOpen] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('');

  const { data, loading, error } = useQuery<{ testCase: TestCase | null }>(GET_TEST_CASE_QUERY, {
    variables: { id },
    skip: isNaN(id),
  });

  const { data: featuresData } = useQuery<{ features: Feature[] }>(GET_FEATURES_QUERY);

  const [deleteTestCase, { loading: deleteLoading }] = useMutation<{
    deleteTestCase: MutationResponse<TestCase>;
  }>(DELETE_TEST_CASE_MUTATION, {
    refetchQueries: [{ query: GET_TEST_CASES_QUERY }],
  });

  const [assignFeature, { loading: assignLoading }] = useMutation<{
    assignFeature: MutationResponse<null>;
  }>(ASSIGN_FEATURE_MUTATION, {
    refetchQueries: [{ query: GET_TEST_CASE_QUERY, variables: { id } }],
  });

  const [unassignFeature, { loading: unassignLoading }] = useMutation<{
    unassignFeature: MutationResponse<null>;
  }>(UNASSIGN_FEATURE_MUTATION, {
    refetchQueries: [{ query: GET_TEST_CASE_QUERY, variables: { id } }],
  });

  const testCase = data?.testCase;
  const allFeatures = featuresData?.features || [];

  // 戻るボタンのクリックハンドラ
  const handleBack = () => {
    // テストケースに紐づく機能がある場合は最初の機能の詳細ページに戻る
    if (testCase?.features && testCase.features.length > 0) {
      router.push(`/features/${testCase.features[0].id}/test-cases`);
    } else {
      // 機能が紐づいていない場合は機能一覧に戻る
      router.push('/features');
    }
  };

  // 未割り当ての機能を取得
  const unassignedFeatures = allFeatures.filter(
    (feature) => !testCase?.features?.some((f) => f.id === feature.id)
  );

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
    } catch (_error) {
      toast.error('エラーが発生しました', {
        id: 'delete-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleAddFeature = async () => {
    if (!selectedFeatureId) return;

    try {
      const result = await assignFeature({
        variables: {
          testCaseId: id,
          featureId: parseInt(selectedFeatureId, 10),
        },
      });

      if (result.data?.assignFeature.isValid) {
        toast.success('機能を追加しました', {
          id: 'assign-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        setAddFeatureDialogOpen(false);
        setSelectedFeatureId('');
      } else {
        toast.error(result.data?.assignFeature.message || '機能の追加に失敗しました', {
          id: 'assign-error',
          style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
        });
      }
    } catch (_error) {
      toast.error('エラーが発生しました', {
        id: 'assign-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    }
  };

  const handleRemoveFeature = async (featureId: number) => {
    try {
      const result = await unassignFeature({
        variables: {
          testCaseId: id,
          featureId: featureId,
        },
      });

      if (result.data?.unassignFeature.isValid) {
        toast.success('機能を削除しました', {
          id: 'unassign-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
      } else {
        toast.error(result.data?.unassignFeature.message || '機能の削除に失敗しました', {
          id: 'unassign-error',
          style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
        });
      }
    } catch (_error) {
      toast.error('エラーが発生しました', {
        id: 'unassign-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    }
  };

  if (isNaN(id)) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/features')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          機能一覧に戻る
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
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
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

          {/* タグ、機能、作成者情報 */}
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

          {/* 機能 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>機能</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setAddFeatureDialogOpen(true)}
                  disabled={unassignedFeatures.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  機能を追加
                </Button>
              </div>
              <CardDescription>
                このテストケースに関連する機能
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testCase.features && testCase.features.length > 0 ? (
                <div className="space-y-3">
                  {testCase.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {feature.color && (
                          <div
                            className="h-8 w-8 rounded border flex-shrink-0"
                            style={{ backgroundColor: feature.color }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{feature.name}</p>
                            <Badge variant={getFeatureStatusBadgeVariant(feature.status)}>
                              {getFeatureStatusLabel(feature.status)}
                            </Badge>
                          </div>
                          {feature.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {feature.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFeature(feature.id)}
                        disabled={unassignLoading}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">機能が割り当てられていません</p>
              )}
            </CardContent>
          </Card>
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

      {/* 機能追加ダイアログ */}
      <Dialog open={addFeatureDialogOpen} onOpenChange={setAddFeatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>機能を追加</DialogTitle>
            <DialogDescription>
              このテストケースに機能を追加します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">機能を選択</label>
              <Select value={selectedFeatureId} onValueChange={setSelectedFeatureId}>
                <SelectTrigger>
                  <SelectValue placeholder="機能を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedFeatures.map((feature) => (
                    <SelectItem key={feature.id} value={feature.id.toString()}>
                      <div className="flex items-center gap-2">
                        {feature.color && (
                          <div
                            className="h-4 w-4 rounded border"
                            style={{ backgroundColor: feature.color }}
                          />
                        )}
                        <span>{feature.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddFeatureDialogOpen(false);
                setSelectedFeatureId('');
              }}
              disabled={assignLoading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleAddFeature}
              disabled={!selectedFeatureId || assignLoading}
            >
              {assignLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
