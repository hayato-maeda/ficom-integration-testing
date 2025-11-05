'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GET_TEST_QUERY, UPDATE_TEST_MUTATION, GET_TESTS_BY_FEATURE_QUERY } from '@/lib/graphql/tests';
import { MutationResponse, Test, TestStatus } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * テスト編集フォームのスキーマ
 */
const testFormSchema = z.object({
  name: z.string().min(1, 'テスト名を入力してください'),
  description: z.string().optional(),
  status: z.string(),
});

type TestFormData = z.infer<typeof testFormSchema>;

/**
 * ステータスオプション
 */
const statusOptions = [
  { value: TestStatus.DRAFT, label: '下書き' },
  { value: TestStatus.IN_REVIEW, label: 'レビュー中' },
  { value: TestStatus.APPROVED, label: '承認済み' },
  { value: TestStatus.REJECTED, label: '却下' },
  { value: TestStatus.ARCHIVED, label: 'アーカイブ' },
];

/**
 * テスト編集ページ
 *
 * 既存のテストを編集するためのフォームを提供します。
 */
export default function TestEditPage() {
  const params = useParams();
  const router = useRouter();
  const featureId = parseInt(params.id as string, 10);
  const testId = parseInt(params.testId as string, 10);

  const { data, loading, error } = useQuery<{ test: Test | null }>(GET_TEST_QUERY, {
    variables: { featureId, id: testId },
    skip: isNaN(featureId) || isNaN(testId),
  });

  const [updateTest, { loading: updateLoading }] = useMutation<{
    updateTest: MutationResponse<Test>;
  }>(UPDATE_TEST_MUTATION, {
    refetchQueries: [
      { query: GET_TEST_QUERY, variables: { featureId, id: testId } },
      { query: GET_TESTS_BY_FEATURE_QUERY, variables: { featureId } },
    ],
  });

  const form = useForm<TestFormData>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      name: '',
      description: '',
      status: TestStatus.DRAFT,
    },
  });

  const test = data?.test;

  // テストデータが取得できたらフォームに設定
  useEffect(() => {
    if (test) {
      form.reset({
        name: test.name,
        description: test.description || '',
        status: test.status,
      });
    }
  }, [test, form]);

  const onSubmit = async (values: TestFormData) => {
    try {
      const result = await updateTest({
        variables: {
          featureId,
          id: testId,
          name: values.name,
          description: values.description || null,
          status: values.status,
        },
      });

      if (result.data?.updateTest.isValid) {
        toast.success('テストを更新しました', {
          id: 'update-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        router.push(`/features/${featureId}/tests`);
      } else {
        toast.error(result.data?.updateTest.message || '更新に失敗しました', {
          id: 'update-error',
          style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
        });
      }
    } catch (_error) {
      toast.error('エラーが発生しました', {
        id: 'update-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    }
  };

  if (isNaN(featureId) || isNaN(testId)) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/features')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          機能一覧に戻る
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-destructive">無効なテストIDです</p>
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

  if (error || !test) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push(`/features/${featureId}/tests`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          テスト一覧に戻る
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-destructive">
              {error ? `エラーが発生しました: ${error.message}` : 'テストが見つかりませんでした'}
            </p>
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

      {/* 編集フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>テストを編集</CardTitle>
          <CardDescription>テストの情報を更新します</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* テスト名 */}
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

              {/* 説明 */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>説明（任意）</FormLabel>
                    <FormControl>
                      <Textarea placeholder="テストの説明を入力" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ステータス */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ステータス</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ステータスを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ボタン */}
              <div className="flex gap-4">
                <Button type="submit" disabled={updateLoading}>
                  {updateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  更新
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/features/${featureId}/tests`)}
                  disabled={updateLoading}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
