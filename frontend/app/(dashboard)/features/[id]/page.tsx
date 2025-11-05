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
import {
  GET_TESTS_BY_FEATURE_QUERY,
  CREATE_TEST_MUTATION,
  UPDATE_TEST_MUTATION,
  DELETE_TEST_MUTATION,
} from '@/lib/graphql/tests';
import { Feature, Test, FeatureStatus, MutationResponse } from '@/types';
import { ArrowLeft, Loader2, Pencil, Plus, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
 * Feature詳細ページ（Test一覧）
 *
 * 指定されたFeatureの詳細情報と、そのFeatureに紐づくTest一覧を表示します。
 */
export default function FeatureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const [addTestDialogOpen, setAddTestDialogOpen] = useState(false);
  const [editTestDialogOpen, setEditTestDialogOpen] = useState(false);
  const [deleteTestDialogOpen, setDeleteTestDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  // ソート状態（初期値はIDの昇順）
  const [sortColumn, setSortColumn] = useState<'id' | 'title' | 'createdAt'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // テスト作成フォームのスキーマ
  const testFormSchema = z.object({
    title: z.string().min(1, 'タイトルを入力してください'),
    description: z.string().optional(),
  });

  const createForm = useForm<z.infer<typeof testFormSchema>>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const editForm = useForm<z.infer<typeof testFormSchema>>({
    resolver: zodResolver(testFormSchema),
  });

  const { data: featureData, loading: featureLoading } = useQuery<{ feature: Feature | null }>(GET_FEATURE_QUERY, {
    variables: { id },
    skip: isNaN(id),
  });

  const { data: testsData, loading: testsLoading } = useQuery<{
    testsByFeature: Test[];
  }>(GET_TESTS_BY_FEATURE_QUERY, {
    variables: { featureId: id },
    skip: isNaN(id),
  });

  const [createTest, { loading: createLoading }] = useMutation<{
    createTest: MutationResponse<Test>;
  }>(CREATE_TEST_MUTATION, {
    refetchQueries: [{ query: GET_TESTS_BY_FEATURE_QUERY, variables: { featureId: id } }],
  });

  const [updateTest, { loading: updateLoading }] = useMutation<{
    updateTest: MutationResponse<Test>;
  }>(UPDATE_TEST_MUTATION, {
    refetchQueries: [{ query: GET_TESTS_BY_FEATURE_QUERY, variables: { featureId: id } }],
  });

  const [deleteTest, { loading: deleteLoading }] = useMutation<{
    deleteTest: MutationResponse<Test>;
  }>(DELETE_TEST_MUTATION, {
    refetchQueries: [{ query: GET_TESTS_BY_FEATURE_QUERY, variables: { featureId: id } }],
  });

  const feature = featureData?.feature;
  const loading = featureLoading || testsLoading;

  // ソートを変更
  const handleSort = (column: 'id' | 'title' | 'createdAt') => {
    if (sortColumn === column) {
      // 同じカラムをクリックした場合は方向を反転
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // 別のカラムをクリックした場合は昇順で開始
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // ソートアイコンを取得
  const getSortIcon = (column: 'id' | 'title' | 'createdAt') => {
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
        case 'title':
          compareValue = a.title.localeCompare(b.title, 'ja');
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
          title: values.title,
          description: values.description,
        },
      });

      if (result.data?.createTest.isValid) {
        toast.success('テストを作成しました', {
          id: 'create-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        setAddTestDialogOpen(false);
        createForm.reset();
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

  const handleEditTest = async (values: z.infer<typeof testFormSchema>) => {
    if (!selectedTest) return;

    try {
      const result = await updateTest({
        variables: {
          id: selectedTest.id,
          title: values.title,
          description: values.description,
        },
      });

      if (result.data?.updateTest.isValid) {
        toast.success('テストを更新しました', {
          id: 'update-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        setEditTestDialogOpen(false);
        setSelectedTest(null);
        editForm.reset();
      } else {
        toast.error(result.data?.updateTest.message || 'テストの更新に失敗しました', {
          id: 'update-error',
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

  const handleDeleteTest = async () => {
    if (!selectedTest) return;

    try {
      const result = await deleteTest({
        variables: { id: selectedTest.id },
      });

      if (result.data?.deleteTest.isValid) {
        toast.success('テストを削除しました', {
          id: 'delete-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        setDeleteTestDialogOpen(false);
        setSelectedTest(null);
      } else {
        toast.error(result.data?.deleteTest.message || 'テストの削除に失敗しました', {
          id: 'delete-error',
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

  const openEditDialog = (test: Test) => {
    setSelectedTest(test);
    editForm.reset({
      title: test.title,
      description: test.description || '',
    });
    setEditTestDialogOpen(true);
  };

  const openDeleteDialog = (test: Test) => {
    setSelectedTest(test);
    setDeleteTestDialogOpen(true);
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
                        onClick={() => handleSort('title')}
                      >
                        タイトル
                        {getSortIcon('title')}
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
                    <TableHead className="w-[100px] text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow
                      key={test.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/features/${id}/tests/${test.id}`)}
                    >
                      <TableCell className="font-medium">{test.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{test.title}</p>
                          {test.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{test.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(test.createdAt), 'yyyy/MM/dd', { locale: ja })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(test);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(test);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>テストを作成</DialogTitle>
            <DialogDescription>新しいテストを作成し、この機能に追加します</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleAddTest)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input placeholder="テストのタイトルを入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
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
                    createForm.reset();
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

      {/* テスト編集ダイアログ */}
      <Dialog open={editTestDialogOpen} onOpenChange={setEditTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>テストを編集</DialogTitle>
            <DialogDescription>テストの情報を更新します</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditTest)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input placeholder="テストのタイトルを入力" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
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
                    setEditTestDialogOpen(false);
                    setSelectedTest(null);
                    editForm.reset();
                  }}
                  disabled={updateLoading}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={updateLoading}>
                  {updateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  更新
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* テスト削除確認ダイアログ */}
      <AlertDialog open={deleteTestDialogOpen} onOpenChange={setDeleteTestDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>テストを削除</AlertDialogTitle>
            <AlertDialogDescription>
              本当にテスト「{selectedTest?.title}」を削除しますか？
              <br />
              この操作は取り消せません。このテストに紐づくテストケースも削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTest}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
