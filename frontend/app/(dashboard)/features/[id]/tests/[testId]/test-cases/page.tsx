'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
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
import { GET_TEST_QUERY } from '@/lib/graphql/tests';
import { CREATE_TEST_CASE_MUTATION, GET_TEST_CASES_BY_TEST_QUERY, UPDATE_TEST_CASE_MUTATION } from '@/lib/graphql/test-cases';
import { Test, TestCase, TestStatus, TestCaseStatus, MutationResponse } from '@/types';
import { ArrowLeft, Loader2, Pencil, Plus, ArrowUpDown, ArrowUp, ArrowDown, X, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/api/files';

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
 * テスト詳細ページ（テストケース一覧）
 *
 * 指定されたテストの詳細情報と、そのテストに紐づくテストケース一覧を表示します。
 */
export default function TestCasesPage() {
  const params = useParams();
  const router = useRouter();
  const featureId = parseInt(params.id as string, 10);
  const testId = parseInt(params.testId as string, 10);
  const [addTestCaseDialogOpen, setAddTestCaseDialogOpen] = useState(false);

  // ソート状態（初期値はIDの昇順）
  const [sortColumn, setSortColumn] = useState<'id' | 'title' | 'status' | 'createdBy' | 'createdAt'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // クリップボードから貼り付けた画像を一時保存
  const [pendingImages, setPendingImages] = useState<Array<{ file: File; preview: string }>>([]);
  const actualResultTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  const { data: testData, loading: testLoading } = useQuery<{ test: Test | null }>(GET_TEST_QUERY, {
    variables: { featureId, id: testId },
    skip: isNaN(featureId) || isNaN(testId),
  });

  const {
    data: testCasesData,
    loading: testCasesLoading,
    refetch,
  } = useQuery<{
    testCasesByTest: TestCase[];
  }>(GET_TEST_CASES_BY_TEST_QUERY, {
    variables: { featureId, testId },
    skip: isNaN(featureId) || isNaN(testId),
  });

  const [createTestCase, { loading: createLoading }] = useMutation<{
    createTestCase: MutationResponse<TestCase>;
  }>(CREATE_TEST_CASE_MUTATION);

  const [updateTestCase] = useMutation<{
    updateTestCase: MutationResponse<TestCase>;
  }>(UPDATE_TEST_CASE_MUTATION);

  const test = testData?.test;
  const loading = testLoading || testCasesLoading;

  // ソートを変更
  const handleSort = (column: 'id' | 'title' | 'status' | 'createdBy' | 'createdAt') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // ソートアイコンを取得
  const getSortIcon = (column: 'id' | 'title' | 'status' | 'createdBy' | 'createdAt') => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  // ソートされたテストケースを取得
  const getSortedTestCases = () => {
    const testCases = testCasesData?.testCasesByTest || [];

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

  /**
   * Ctrl+Vでクリップボードから画像を貼り付け
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          // プレビュー用のData URLを作成
          const reader = new FileReader();
          reader.onload = (event) => {
            const preview = event.target?.result as string;
            setPendingImages((prev) => [...prev, { file, preview }]);
            toast.success(`画像を追加しました: ${file.name || '貼り付けた画像'}`, {
              id: 'image-added',
              style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  /**
   * 貼り付けた画像を削除
   */
  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
    toast.success('画像を削除しました', {
      id: 'image-removed',
      style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
    });
  };

  const handleAddTestCase = async (values: z.infer<typeof testCaseFormSchema>) => {
    try {
      // まずテストケースを作成
      const result = await createTestCase({
        variables: {
          featureId,
          testId,
          title: values.title,
          description: values.description,
          steps: values.steps,
          expectedResult: values.expectedResult,
          actualResult: values.actualResult,
        },
      });

      if (result.data?.createTestCase.isValid) {
        const createdTestCase = result.data.createTestCase.data;
        if (!createdTestCase) {
          throw new Error('テストケースの作成に失敗しました');
        }

        const testCaseId = createdTestCase.id;

        // 貼り付けた画像がある場合、アップロード
        if (pendingImages.length > 0) {
          toast.info('画像をアップロード中...', {
            id: 'uploading-images',
            style: { background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' },
          });

          // 画像をアップロードしてfileIdを取得
          const uploadedFileIds: number[] = [];
          for (const { file } of pendingImages) {
            const uploadedFile = await uploadFile(file, featureId, testId, testCaseId);
            uploadedFileIds.push(uploadedFile.id);
          }

          // 実績結果に画像タグを追加
          const imageTags = uploadedFileIds.map((fileId) => `[[image:${fileId}]]`).join('\n');
          const updatedActualResult = values.actualResult
            ? `${values.actualResult}\n\n${imageTags}`
            : imageTags;

          // テストケースを更新して画像タグを実績結果に反映
          await updateTestCase({
            variables: {
              featureId,
              testId,
              id: testCaseId,
              actualResult: updatedActualResult,
            },
          });

          toast.success(`テストケースと${pendingImages.length}件の画像を作成しました`, {
            id: 'create-success',
            style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
          });
        } else {
          toast.success('テストケースを作成しました', {
            id: 'create-success',
            style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
          });
        }

        setAddTestCaseDialogOpen(false);
        form.reset();
        setPendingImages([]);
        refetch();
      } else {
        toast.error(result.data?.createTestCase.message || 'テストケースの作成に失敗しました', {
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

  if (isNaN(featureId) || isNaN(testId)) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push(`/features/${featureId}/tests`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          テスト一覧に戻る
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-destructive">無効なIDです</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push(`/features/${featureId}/tests`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          テスト一覧に戻る
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push(`/features/${featureId}/tests`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          テスト一覧に戻る
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">テストが見つかりませんでした</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push(`/features/${featureId}/tests`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          テスト一覧に戻る
        </Button>
      </div>

      {/* テスト詳細カード */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{test.name}</CardTitle>
                <Badge variant={getTestStatusBadgeVariant(test.status)}>{getTestStatusLabel(test.status)}</Badge>
              </div>
              {test.description && <CardDescription className="text-base">{test.description}</CardDescription>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">テストID</p>
              <p className="text-lg font-semibold">#{test.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">機能</p>
              <p className="text-lg">{test.feature?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">作成日</p>
              <p className="text-lg">{format(new Date(test.createdAt), 'yyyy年MM月dd日', { locale: ja })}</p>
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
                  ? `${testCases.length}件のテストケースがこのテストに紐づいています`
                  : 'このテストに紐づくテストケースはありません'}
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddTestCaseDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {testCases.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>このテストに紐づくテストケースはありません</p>
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
                      key={`${testCase.featureId}-${testCase.testId}-${testCase.id}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/features/${featureId}/tests/${testId}/test-cases/${testCase.id}`)}
                    >
                      <TableCell className="font-medium">{testCase.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{testCase.title}</p>
                          {testCase.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{testCase.description}</p>
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
                          {testCase.tags.map((tag, tagIndex) => (
                            <Badge
                              key={`${testCase.featureId}-${testCase.testId}-${testCase.id}-${tag.id}-${tagIndex}`}
                              variant="outline"
                              style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{testCase.createdBy.name}</TableCell>
                      <TableCell>{format(new Date(testCase.createdAt), 'yyyy/MM/dd', { locale: ja })}</TableCell>
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
            <DialogDescription>新しいテストケースを作成し、このテストに追加します</DialogDescription>
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
                      <Textarea placeholder="テストケースの説明を入力" className="min-h-[80px]" {...field} />
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
                      <Textarea placeholder="テスト手順を入力" className="min-h-[100px]" {...field} />
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
                      <Textarea placeholder="期待結果を入力" className="min-h-[80px]" {...field} />
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
                        placeholder="実績結果を入力 (Ctrl+Vで画像を貼り付けできます)"
                        className="min-h-[80px]"
                        {...field}
                        ref={actualResultTextareaRef}
                        onPaste={handlePaste}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ctrl+Vで画像を貼り付けると、テストケース作成時に自動的にアップロードされます
                    </p>
                    <FormMessage />

                    {/* 貼り付けた画像のプレビュー */}
                    {pendingImages.length > 0 && (
                      <div className="mt-4 rounded-lg border p-4 bg-muted/30">
                        <div className="flex items-center gap-2 mb-3">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="text-sm font-medium">貼り付けた画像 ({pendingImages.length}件)</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {pendingImages.map((item, index) => (
                            <div key={index} className="relative group rounded-md border overflow-hidden">
                              <img src={item.preview} alt={`貼り付けた画像 ${index + 1}`} className="w-full h-32 object-cover" />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removePendingImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
    </div>
  );
}
