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
import { CREATE_FEATURE_MUTATION, GET_FEATURES_QUERY } from '@/lib/graphql/features';
import { MutationResponse, Feature } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * テスト作成フォームのスキーマ
 */
const featureFormSchema = z.object({
  name: z.string().min(1, 'テスト名を入力してください'),
  description: z.string().optional(),
  color: z
    .string()
    .optional()
    .refine((val) => !val || /^#[0-9A-Fa-f]{6}$/.test(val), 'カラーコードは#XXXXXXの形式で入力してください'),
});

type FeatureFormData = z.infer<typeof featureFormSchema>;

/**
 * 機能作成ページ
 *
 * 新しい機能を作成するためのフォームを提供します。
 */
export default function FeatureNewPage() {
  const router = useRouter();

  const [createFeature, { loading }] = useMutation<{
    createFeature: MutationResponse<Feature>;
  }>(CREATE_FEATURE_MUTATION, {
    refetchQueries: [{ query: GET_FEATURES_QUERY }],
  });

  const form = useForm<FeatureFormData>({
    resolver: zodResolver(featureFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3b82f6',
    },
  });

  const onSubmit = async (data: FeatureFormData) => {
    try {
      const result = await createFeature({
        variables: {
          name: data.name,
          description: data.description || undefined,
          color: data.color || undefined,
        },
      });

      if (result.data?.createFeature.isValid) {
        toast.success('テストを作成しました', {
          id: 'create-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        router.push('/features');
      } else {
        toast.error(result.data?.createFeature.message || '作成に失敗しました', {
          id: 'create-error',
          style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
        });
      }
    } catch (_error) {
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
        <Button variant="ghost" onClick={() => router.push('/features')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          機能一覧に戻る
        </Button>
      </div>

      {/* フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>新規テスト作成</CardTitle>
          <CardDescription>新しいテストを作成します</CardDescription>
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
                    <FormLabel>
                      テスト名<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="例: ユーザー認証テスト" {...field} />
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
                      <Textarea placeholder="テストの説明を入力" className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 色 */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>色</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={field.value || '#3b82f6'}
                          onChange={field.onChange}
                          className="h-10 w-20 cursor-pointer rounded border"
                        />
                        <Input
                          placeholder="#3b82f6"
                          value={field.value || ''}
                          onChange={field.onChange}
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <p className="text-sm text-muted-foreground">機能を識別するための色を選択してください</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* アクションボタン */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push('/features')} disabled={loading}>
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
