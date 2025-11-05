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
  GET_FEATURE_QUERY,
  GET_TEST_CASES_BY_FEATURE_QUERY,
  ASSIGN_FEATURE_MUTATION,
} from '@/lib/graphql/features';
import { CREATE_TEST_CASE_MUTATION } from '@/lib/graphql/test-cases';
import { Feature, TestCase, FeatureStatus, TestCaseStatus, MutationResponse } from '@/types';
import { ArrowLeft, Loader2, Pencil, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
 * テストケースステータスバッジのスタイルを取得
 */
const getTestCaseStatusBadgeVariant = (status: string) => {
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
 * テストケースステータスの日本語表示名を取得
 */
const getTestCaseStatusLabel = (status: string) => {
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
 * 機能詳細ページ（テストケース一覧）
 *
 * 指定された機能の詳細情報と、その機能に紐づくテストケース一覧を表示します。
 */
export default function FeatureTestCasesPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const [addTestCaseDialogOpen, setAddTestCaseDialogOpen] = useState(false);

  // ソート状態（初期値はIDの昇順）
  const [sortColumn, setSortColumn] = useState<'id' | 'title' | 'status' | 'createdBy' | 'createdAt'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // テストケース作成フォームのスキーマ
  const testCaseFormSchema = z.object({
    title: z.string().min(1, 'タイトルを入力してください'),
    description: z.string().optional(),
    steps: z.string().min(1, 'テスト手順を入力してください'),
    expectedResult: z.string().min(1, '期待結果を入力してください'),
    actualResult: z.string().optional(),
  });

  const form = useForm<z.infer<typeof testCaseFormSchema>>({
    resolver: zodResolver(testCaseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      steps: '',
      expectedResult: '',
      actualResult: '',
    },
  });

  const { data: featureData, loading: featureLoading } = useQuery<{ feature: Feature | null }>(
    GET_FEATURE_QUERY,
    {
      variables: { id },
      skip: isNaN(id),
    }
  );

  const { data: testCasesData, loading: testCasesLoading } = useQuery<{
    testCasesByFeature: TestCase[];
  }>(GET_TEST_CASES_BY_FEATURE_QUERY, {
    variables: { featureId: id },
    skip: isNaN(id),
  });

  const [createTestCase, { loading: createLoading }] = useMutation<{
    createTestCase: MutationResponse<TestCase>;
  }>(CREATE_TEST_CASE_MUTATION);

  const [assignFeature, { loading: assignLoading }] = useMutation<{
    assignFeature: MutationResponse<null>;
  }>(ASSIGN_FEATURE_MUTATION, {
    refetchQueries: [{ query: GET_TEST_CASES_BY_FEATURE_QUERY, variables: { featureId: id } }],
  });

  const feature = featureData?.feature;
  const loading = featureLoading || testCasesLoading;

  // ソートを変更
  const handleSort = (column: 'id' | 'title' | 'status' | 'createdBy' | 'createdAt') => {
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
  const getSortIcon = (column: 'id' | 'title' | 'status' | 'createdBy' | 'createdAt') => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // ソートされたテストケースを取得
  const getSortedTestCases = () => {
    const testCases = testCasesData?.testCasesByFeature || [];

    return [...testCases].sort((a, b) => {
      let compareValue = 0;

      switch (sortColumn) {
        case 'id':
          compareValue = a.id - b.id;
          break;
        case 'title':
          compareValue = a.title.localeCompare(b.title, 'ja');
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

  const testCases = getSortedTestCases();

  const handleAddTestCase = async (values: z.infer<typeof testCaseFormSchema>) => {
    try {
      // テストケースを作成
      const createResult = await createTestCase({
        variables: {
          title: values.title,
          description: values.description,
          steps: values.steps,
          expectedResult: values.expectedResult,
          actualResult: values.actualResult,
        },
      });

      if (!createResult.data?.createTestCase.isValid || !createResult.data?.createTestCase.data) {
        toast.error(
          createResult.data?.createTestCase.message || 'テストケースの作成に失敗しました',
          {
            id: 'create-error',
            style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
          }
        );
        return;
      }

      // 作成したテストケースを機能に割り当て
      const testCaseId = createResult.data.createTestCase.data.id;
      const assignResult = await assignFeature({
        variables: {
          testCaseId,
          featureId: id,
        },
      });

      if (assignResult.data?.assignFeature.isValid) {
        toast.success('テストケースを作成し、機能に追加しました', {
          id: 'create-assign-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        setAddTestCaseDialogOpen(false);
        form.reset();
      } else {
        toast.error(
          assignResult.data?.assignFeature.message || 'テストケースの追加に失敗しました',
          {
            id: 'assign-error',
            style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
          }
        );
      }
    } catch (_error) {
      toast.error('エラーが発生しました', {
        id: 'error',
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
              {feature.description && (
                <CardDescription className="text-base">{feature.description}</CardDescription>
              )}
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
                    <div
                      className="h-6 w-6 rounded border"
                      style={{ backgroundColor: feature.color }}
                    />
                    <span className="text-sm">{feature.color}</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">作成日</p>
              <p className="text-lg">
                {format(new Date(feature.createdAt), 'yyyy年MM月dd日', { locale: ja })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* テストケース一覧カード */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>テストケース一覧</CardTitle>
              <CardDescription>
                {testCases.length > 0
                  ? `${testCases.length}件のテストケースがこの機能に紐づいています`
                  : 'この機能に紐づくテストケースはありません'}
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddTestCaseDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              テストケースを追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {testCases.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>この機能に紐づくテストケースはありません</p>
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
                        onClick={() => handleSort('status')}
                      >
                        ステータス
                        {getSortIcon('status')}
                      </button>
                    </TableHead>
                    <TableHead>タグ</TableHead>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testCases.map((testCase) => (
                    <TableRow
                      key={testCase.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/test-cases/${testCase.id}`)}
                    >
                      <TableCell className="font-medium">{testCase.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{testCase.title}</p>
                          {testCase.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {testCase.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTestCaseStatusBadgeVariant(testCase.status)}>
                          {getTestCaseStatusLabel(testCase.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
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
                      </TableCell>
                      <TableCell>{testCase.createdBy.name}</TableCell>
                      <TableCell>
                        {format(new Date(testCase.createdAt), 'yyyy/MM/dd', { locale: ja })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* テストケース追加ダイアログ */}
      <Dialog open={addTestCaseDialogOpen} onOpenChange={setAddTestCaseDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>テストケースを作成</DialogTitle>
            <DialogDescription>新しいテストケースを作成し、この機能に追加します</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddTestCase)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input placeholder="テストケースのタイトルを入力" {...field} />
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
                      <Textarea
                        placeholder="テストケースの説明を入力"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="steps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>テスト手順</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="テスト手順を入力"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedResult"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>期待結果</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="期待結果を入力"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualResult"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>実績結果（任意）</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="実績結果を入力"
                        className="min-h-[80px]"
                        {...field}
                      />
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
                    setAddTestCaseDialogOpen(false);
                    form.reset();
                  }}
                  disabled={createLoading || assignLoading}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={createLoading || assignLoading}>
                  {(createLoading || assignLoading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  作成して追加
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
