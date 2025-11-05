'use client';

import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CREATE_TEST_CASE_MUTATION, GET_TEST_CASES_QUERY } from '@/lib/graphql/test-cases';
import { MutationResponse, TestCase } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * テストケース作成フォームのスキーマ
 */
const testCaseFormSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  description: z.string().optional(),
  steps: z.string().min(1, 'テスト手順を入力してください'),
  expectedResult: z.string().min(1, '期待結果を入力してください'),
  actualResult: z.string().optional(),
});

type TestCaseFormData = z.infer<typeof testCaseFormSchema>;

/**
 * テストケース作成ページ
 *
 * 新しいテストケースを作成するためのフォームを提供します。
 */
export default function TestCaseNewPage() {
  const router = useRouter();

  const [createTestCase, { loading }] = useMutation<{
    createTestCase: MutationResponse<TestCase>;
  }>(CREATE_TEST_CASE_MUTATION, {
    refetchQueries: [{ query: GET_TEST_CASES_QUERY }],
  });

  const form = useForm<TestCaseFormData>({
    resolver: zodResolver(testCaseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      steps: '',
      expectedResult: '',
      actualResult: '',
    },
  });

  const onSubmit = async (data: TestCaseFormData) => {
    try {
      const result = await createTestCase({
        variables: {
          title: data.title,
          description: data.description || undefined,
          steps: data.steps,
          expectedResult: data.expectedResult,
          actualResult: data.actualResult || undefined,
        },
      });

      if (result.data?.createTestCase.isValid) {
        toast.success('テストケースを作成しました', {
          id: 'create-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        router.push('/test-cases');
      } else {
        toast.error(result.data?.createTestCase.message || '作成に失敗しました', {
          id: 'create-error',
          style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
        });
      }
    } catch (error) {
      toast.error('エラーが発生しました', {
        id: 'create-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/test-cases')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          テストケース一覧に戻る
        </Button>
      </div>

      {/* フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>新規テストケース作成</CardTitle>
          <CardDescription>新しいテストケースを作成します</CardDescription>
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
                      <Textarea
                        placeholder="テストケースの説明を入力"
                        className="min-h-[100px]"
                        {...field}
                      />
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
                      <Textarea
                        placeholder="テストの実行手順を入力"
                        className="min-h-[150px]"
                        {...field}
                      />
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
                      <Textarea
                        placeholder="期待される結果を入力"
                        className="min-h-[100px]"
                        {...field}
                      />
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
                      <Textarea
                        placeholder="実際の結果を入力（任意）"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* アクションボタン */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/test-cases')}
                  disabled={loading}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  作成
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
