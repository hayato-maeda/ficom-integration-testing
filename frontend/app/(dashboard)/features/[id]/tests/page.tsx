'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { GET_FEATURE_QUERY } from '@/lib/graphql/features';
import { CREATE_TEST_MUTATION, DELETE_TEST_MUTATION, GET_TESTS_BY_FEATURE_QUERY } from '@/lib/graphql/tests';
import { Feature, Test, FeatureStatus, TestStatus, MutationResponse } from '@/types';
import { ArrowLeft, Loader2, Pencil, Plus, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { toast } from 'sonner';

/**
 * 機能ステータスバッジのスタイルを取得
 */
const getFeatureStatusBadgeVariant = (status: string) => {
  switch (status) {
    case FeatureStatus.COMPLETED:
      return 'default';
    case FeatureStatus.DEVELOPING:
    case FeatureStatus.TESTING:
      return 'secondary';
    case FeatureStatus.ON_HOLD:
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
 * テストステータスバッジのスタイルを取得
 */
const getTestStatusBadgeVariant = (status: string) => {
  switch (status) {
    case TestStatus.APPROVED:
      return 'default';
    case TestStatus.IN_REVIEW:
      return 'secondary';
    case TestStatus.REJECTED:
      return 'destructive';
    case TestStatus.ARCHIVED:
      return 'outline';
    case TestStatus.DRAFT:
    default:
      return 'outline';
  }
};

/**
 * テストステータスの日本語表示名を取得
 */
const getTestStatusLabel = (status: string) => {
  switch (status) {
    case TestStatus.DRAFT:
      return '下書き';
    case TestStatus.IN_REVIEW:
      return 'レビュー中';
    case TestStatus.APPROVED:
      return '承認済み';
    case TestStatus.REJECTED:
      return '却下';
    case TestStatus.ARCHIVED:
      return 'アーカイブ';
    default:
      return status;
  }
};

/**
 * 機能詳細ページ（テスト一覧）
 *
 * 指定された機能の詳細情報と、その機能に紐づくテスト一覧を表示します。
 */
export default function FeatureTestsPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const [addTestDialogOpen, setAddTestDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);

  // ソート状態（初期値はIDの昇順）
  const [sortColumn, setSortColumn] = useState<'id' | 'name' | 'status' | 'createdBy' | 'createdAt'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // テスト作成フォームのスキーマ
  const testFormSchema = z.object({
    name: z.string().min(1, 'テスト名を入力してください'),
    description: z.string().optional(),
  });

  const form = useForm<z.infer<typeof testFormSchema>>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { data: featureData, loading: featureLoading } = useQuery<{ feature: Feature | null }>(GET_FEATURE_QUERY, {
    variables: { id },
    skip: isNaN(id),
  });

  const {
    data: testsData,
    loading: testsLoading,
    refetch,
  } = useQuery<{
    testsByFeature: Test[];
  }>(GET_TESTS_BY_FEATURE_QUERY, {
    variables: { featureId: id },
    skip: isNaN(id),
  });

  const [createTest, { loading: createLoading }] = useMutation<{
    createTest: MutationResponse<Test>;
  }>(CREATE_TEST_MUTATION);

  const [deleteTest, { loading: deleteLoading }] = useMutation<{
    deleteTest: MutationResponse<Test>;
  }>(DELETE_TEST_MUTATION, {
    refetchQueries: [{ query: GET_TESTS_BY_FEATURE_QUERY, variables: { featureId: id } }],
  });

  const feature = featureData?.feature;
  const loading = featureLoading || testsLoading;

  // ソートを変更
  const handleSort = (column: 'id' | 'name' | 'status' | 'createdBy' | 'createdAt') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // ソートアイコンを取得
  const getSortIcon = (column: 'id' | 'name' | 'status' | 'createdBy' | 'createdAt') => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  // ソートされたテストを取得
  const getSortedTests = () => {
    const tests = testsData?.testsByFeature || [];

    return [...tests].sort((a, b) => {
      let compareValue = 0;

      switch (sortColumn) {
        case 'id':
          compareValue = a.id - b.id;
          break;
        case 'name':
          compareValue = a.name.localeCompare(b.name, 'ja');
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
        case 'createdBy':
          compareValue = a.createdBy.name.localeCompare(b.createdBy.name, 'ja');
          break;
        case 'createdAt':
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });
  };

  const tests = getSortedTests();

  const handleAddTest = async (values: z.infer<typeof testFormSchema>) => {
    try {
      const result = await createTest({
        variables: {
          featureId: id,
          name: values.name,
          description: values.description,
          status: 'DRAFT',
        },
      });

      if (result.data?.createTest.isValid) {
        toast.success('テストを作成しました', {
          id: 'create-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        setAddTestDialogOpen(false);
        form.reset();
        refetch();
      } else {
        toast.error(result.data?.createTest.message || 'テストの作成に失敗しました', {
          id: 'create-error',
          style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
        });
      }
    } catch (_error) {
      toast.error('エラーが発生しました', {
        id: 'error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    }
  };

  const handleEditClick = (e: React.MouseEvent, test: Test) => {
    e.stopPropagation();
    router.push(`/features/${id}/tests/${test.id}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent, test: Test) => {
    e.stopPropagation();
    setTestToDelete(test);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!testToDelete) return;

    try {
      const result = await deleteTest({
        variables: {
          featureId: id,
          id: testToDelete.id,
        },
      });

      if (result.data?.deleteTest.isValid) {
        toast.success('テストを削除しました', {
          id: 'delete-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
      } else {
        toast.error(result.data?.deleteTest.message || '削除に失敗しました', {
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
      setTestToDelete(null);
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
            <p className="text-destructive">無効な機能IDです</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/features')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          機能一覧に戻る
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!feature) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/features')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          機能一覧に戻る
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">機能が見つかりませんでした</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* パンくずリスト */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/features">機能一覧</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{feature.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/features')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          機能一覧に戻る
        </Button>
        <Button onClick={() => router.push(`/features/${id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          編集
        </Button>
      </div>

      {/* 機能詳細カード */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{feature.name}</CardTitle>
                <Badge variant={getFeatureStatusBadgeVariant(feature.status)}>
                  {getFeatureStatusLabel(feature.status)}
                </Badge>
              </div>
              {feature.description && <CardDescription className="text-base">{feature.description}</CardDescription>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">機能ID</p>
              <p className="text-lg font-semibold">#{feature.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">色</p>
              <div className="flex items-center gap-2">
                {feature.color ? (
                  <>
                    <div className="h-6 w-6 rounded border" style={{ backgroundColor: feature.color }} />
                    <span className="text-sm">{feature.color}</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">作成日</p>
              <p className="text-lg">{format(new Date(feature.createdAt), 'yyyy年MM月dd日', { locale: ja })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* テスト一覧カード */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>テスト一覧</CardTitle>
              <CardDescription>
                {tests.length > 0
                  ? `${tests.length}件のテストがこの機能に紐づいています`
                  : 'この機能に紐づくテストはありません'}
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddTestDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>この機能に紐づくテストはありません</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <button
                        className="flex items-center font-medium hover:text-foreground"
                        onClick={() => handleSort('id')}
                      >
                        ID
                        {getSortIcon('id')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center font-medium hover:text-foreground"
                        onClick={() => handleSort('name')}
                      >
                        テスト名
                        {getSortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center font-medium hover:text-foreground"
                        onClick={() => handleSort('status')}
                      >
                        ステータス
                        {getSortIcon('status')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center font-medium hover:text-foreground"
                        onClick={() => handleSort('createdBy')}
                      >
                        作成者
                        {getSortIcon('createdBy')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center font-medium hover:text-foreground"
                        onClick={() => handleSort('createdAt')}
                      >
                        作成日
                        {getSortIcon('createdAt')}
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow
                      key={test.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/features/${id}/tests/${test.id}/test-cases`)}
                    >
                      <TableCell className="font-medium">{test.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{test.name}</p>
                          {test.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{test.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTestStatusBadgeVariant(test.status)}>
                          {getTestStatusLabel(test.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{test.createdBy.name}</TableCell>
                      <TableCell>{format(new Date(test.createdAt), 'yyyy/MM/dd', { locale: ja })}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleEditClick(e, test)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDeleteClick(e, test)}
                            disabled={deleteLoading}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* テスト追加ダイアログ */}
      <Dialog open={addTestDialogOpen} onOpenChange={setAddTestDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>テストを作成</DialogTitle>
            <DialogDescription>新しいテストを作成し、この機能に追加します</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddTest)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>テスト名</FormLabel>
                    <FormControl>
                      <Input placeholder="テスト名を入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>説明（任意）</FormLabel>
                    <FormControl>
                      <Textarea placeholder="テストの説明を入力" className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddTestDialogOpen(false);
                    form.reset();
                  }}
                  disabled={createLoading}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  作成
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>テストを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。テスト「{testToDelete?.name}」とそれに属するすべてのテストケースを完全に削除します。
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
