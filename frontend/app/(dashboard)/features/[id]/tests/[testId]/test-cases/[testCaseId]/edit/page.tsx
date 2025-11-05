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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GET_TEST_CASE_QUERY, UPDATE_TEST_CASE_MUTATION } from '@/lib/graphql/test-cases';
import { MutationResponse, TestCase, TestCaseStatus } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * テストケース編集フォームのスキーマ
 */
const testCaseFormSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  description: z.string().optional(),
  steps: z.string().min(1, 'テスト手順を入力してください'),
  expectedResult: z.string().min(1, '期待結果を入力してください'),
  actualResult: z.string().optional(),
  status: z.string(),
});

type TestCaseFormData = z.infer<typeof testCaseFormSchema>;

/**
 * ステータスオプション
 */
const statusOptions = [
  { value: TestCaseStatus.DRAFT, label: '下書き' },
  { value: TestCaseStatus.IN_REVIEW, label: 'レビュー中' },
  { value: TestCaseStatus.APPROVED, label: '承認済み' },
  { value: TestCaseStatus.REJECTED, label: '却下' },
  { value: TestCaseStatus.ARCHIVED, label: 'アーカイブ' },
];

/**
 * テストケース編集ページ
 *
 * 既存のテストケースを編集するためのフォームを提供します。
 */
export default function TestCaseEditPage() {
  const params = useParams();
  const router = useRouter();
  const featureId = parseInt(params.id as string, 10);
  const testId = parseInt(params.testId as string, 10);
  const testCaseId = parseInt(params.testCaseId as string, 10);

  const { data, loading: queryLoading } = useQuery<{ testCase: TestCase | null }>(GET_TEST_CASE_QUERY, {
    variables: { id: testCaseId },
    skip: isNaN(testCaseId),
  });

  const [updateTestCase, { loading: mutationLoading }] = useMutation<{
    updateTestCase: MutationResponse<TestCase>;
  }>(UPDATE_TEST_CASE_MUTATION);

  const form = useForm<TestCaseFormData>({
    resolver: zodResolver(testCaseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      steps: '',
      expectedResult: '',
      actualResult: '',
      status: TestCaseStatus.DRAFT,
    },
  });

  const testCase = data?.testCase;

  // データが取得できたらフォームに設定
  useEffect(() => {
    if (testCase) {
      form.reset({
        title: testCase.title,
        description: testCase.description || '',
        steps: testCase.steps,
        expectedResult: testCase.expectedResult,
        actualResult: testCase.actualResult || '',
        status: testCase.status,
      });
    }
  }, [testCase, form]);

  const onSubmit = async (data: TestCaseFormData) => {
    try {
      const result = await updateTestCase({
        variables: {
          id: testCaseId,
          title: data.title,
          description: data.description || undefined,
          steps: data.steps,
          expectedResult: data.expectedResult,
          actualResult: data.actualResult || undefined,
          status: data.status,
        },
      });

      if (result.data?.updateTestCase.isValid) {
        toast.success('テストケースを更新しました', {
          id: 'update-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        router.push(`/features/${featureId}/tests/${testId}/test-cases/${testCaseId}`);
      } else {
        toast.error(result.data?.updateTestCase.message || '更新に失敗しました', {
          id: 'update-error',
          style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
        });
      }
    } catch (error) {
      toast.error('エラーが発生しました', {
        id: 'update-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    }
  };

  if (isNaN(featureId) || isNaN(testId) || isNaN(testCaseId)) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push(`/features/${featureId}/tests/${testId}/test-cases`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          テストケース一覧に戻る
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-destructive">無効なIDです</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (queryLoading) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/features/${featureId}/tests/${testId}/test-cases/${testCaseId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          詳細に戻る
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!testCase) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push(`/features/${featureId}/tests/${testId}/test-cases`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          テストケース一覧に戻る
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">テストケースが見つかりませんでした</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push(`/features/${featureId}/tests/${testId}/test-cases/${testCaseId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          詳細に戻る
        </Button>
      </div>

      {/* フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>テストケース編集</CardTitle>
          <CardDescription>テストケース #{testCaseId} を編集します</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* タイトル */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      タイトル<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="テストケースのタイトルを入力" {...field} />
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
                    <FormLabel>説明</FormLabel>
                    <FormControl>
                      <Textarea placeholder="テストケースの説明を入力" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* テスト手順 */}
              <FormField
                control={form.control}
                name="steps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      テスト手順<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="テストの実行手順を入力" className="min-h-[150px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 期待結果 */}
              <FormField
                control={form.control}
                name="expectedResult"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      期待結果<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="期待される結果を入力" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 実績結果 */}
              <FormField
                control={form.control}
                name="actualResult"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>実績結果</FormLabel>
                    <FormControl>
                      <Textarea placeholder="実際の結果を入力（任意）" className="min-h-[100px]" {...field} />
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

              {/* アクションボタン */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/features/${featureId}/tests/${testId}/test-cases/${testCaseId}`)}
                  disabled={mutationLoading}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={mutationLoading}>
                  {mutationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  更新
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
