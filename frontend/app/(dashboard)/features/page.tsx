'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { GET_FEATURES_QUERY, DELETE_FEATURE_MUTATION } from '@/lib/graphql/features';
import { Feature, FeatureStatus, MutationResponse } from '@/types';
import { Plus, Loader2, Search, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { toast } from 'sonner';

/**
 * ステータスバッジのスタイルを取得
 */
const getStatusBadgeVariant = (status: string) => {
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
 * ステータスの日本語表示名を取得
 */
const getStatusLabel = (status: string) => {
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
 * 機能一覧ページ
 *
 * 機能の一覧を表示し、検索・フィルタリング・作成・削除機能を提供します。
 */
export default function FeaturesPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery<{ features: Feature[] }>(GET_FEATURES_QUERY);

  // 検索・フィルタリング状態
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 削除ダイアログ状態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<Feature | null>(null);

  // 削除ミューテーション
  const [deleteFeature, { loading: deleteLoading }] = useMutation<{
    deleteFeature: MutationResponse<Feature>;
  }>(DELETE_FEATURE_MUTATION, {
    refetchQueries: [{ query: GET_FEATURES_QUERY }],
  });

  // フィルターをクリア
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  // フィルタリングされた機能を取得
  const getFilteredFeatures = () => {
    if (!data?.features) return [];

    return data.features.filter((feature) => {
      // 検索クエリでフィルタリング（機能名と説明）
      const matchesSearch =
        !searchQuery ||
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // ステータスでフィルタリング
      const matchesStatus = statusFilter === 'all' || feature.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const filteredFeatures = getFilteredFeatures();

  // 削除確認ダイアログを開く
  const openDeleteDialog = (feature: Feature, e: React.MouseEvent) => {
    e.stopPropagation();
    setFeatureToDelete(feature);
    setDeleteDialogOpen(true);
  };

  // 削除実行
  const handleDelete = async () => {
    if (!featureToDelete) return;

    try {
      const result = await deleteFeature({
        variables: { id: featureToDelete.id },
      });

      if (result.data?.deleteFeature.isValid) {
        toast.success(result.data.deleteFeature.message || '機能を削除しました');
        setDeleteDialogOpen(false);
        setFeatureToDelete(null);
      } else {
        toast.error(result.data?.deleteFeature.message || '機能の削除に失敗しました');
      }
    } catch (error) {
      toast.error('機能の削除中にエラーが発生しました');
      console.error('Delete feature error:', error);
    }
  };

  // 行クリックで詳細ページへ遷移
  const handleRowClick = (featureId: number) => {
    router.push(`/features/${featureId}/test-cases`);
  };

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">機能</h1>
          <p className="text-muted-foreground">機能の管理とテストケースの整理</p>
        </div>
        <Button onClick={() => router.push('/features/new')}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </div>

      {/* 検索・フィルタリング */}
      <Card>
        <CardHeader>
          <CardTitle>検索・フィルタリング</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-10 md:items-end">
            {/* 検索 */}
            <div className="md:col-span-8">
              <label className="text-sm font-medium">検索</label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="機能名や説明で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* ステータスフィルター */}
            <div className="md:col-span-1">
              <label className="text-sm font-medium">ステータス</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1.5 min-w-[100px]">
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value={FeatureStatus.PLANNING}>計画中</SelectItem>
                  <SelectItem value={FeatureStatus.DEVELOPING}>開発中</SelectItem>
                  <SelectItem value={FeatureStatus.TESTING}>テスト中</SelectItem>
                  <SelectItem value={FeatureStatus.COMPLETED}>完了</SelectItem>
                  <SelectItem value={FeatureStatus.ON_HOLD}>保留</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* クリアボタン */}
            <div className="md:col-span-1">
              <Button variant="outline" onClick={clearFilters} className="mt-1.5 w-full">
                <X className="mr-2 h-4 w-4" />
                クリア
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 機能一覧 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>機能一覧</CardTitle>
              <CardDescription>
                {filteredFeatures.length > 0
                  ? `${filteredFeatures.length}件の機能`
                  : '登録されている機能の一覧です'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12 text-destructive">
              <p>エラーが発生しました: {error.message}</p>
            </div>
          )}

          {!loading && !error && data?.features && data.features.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>機能が登録されていません</p>
            </div>
          )}

          {!loading && !error && data?.features && data.features.length > 0 && filteredFeatures.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>検索条件に一致する機能がありません</p>
            </div>
          )}

          {!loading && !error && filteredFeatures.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>機能名</TableHead>
                    <TableHead>説明</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>色</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead className="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeatures.map((feature) => (
                    <TableRow
                      key={feature.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(feature.id)}
                    >
                      <TableCell className="font-medium">{feature.id}</TableCell>
                      <TableCell>
                        <p className="font-medium">{feature.name}</p>
                      </TableCell>
                      <TableCell>
                        {feature.description ? (
                          <p className="text-sm text-muted-foreground line-clamp-1">{feature.description}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">-</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(feature.status)}>
                          {getStatusLabel(feature.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {feature.color ? (
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 w-6 rounded border"
                              style={{ backgroundColor: feature.color }}
                            />
                            <span className="text-sm text-muted-foreground">{feature.color}</span>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">-</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(feature.createdAt), 'yyyy/MM/dd', { locale: ja })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => openDeleteDialog(feature, e)}
                          disabled={deleteLoading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>機能を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {featureToDelete && (
                <>
                  機能「{featureToDelete.name}」を削除します。
                  <br />
                  この操作は取り消せません。
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteLoading} className="bg-destructive hover:bg-destructive/90">
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  削除中...
                </>
              ) : (
                '削除'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
