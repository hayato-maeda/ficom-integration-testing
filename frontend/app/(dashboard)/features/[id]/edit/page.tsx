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
import { GET_FEATURE_QUERY, GET_FEATURES_QUERY, UPDATE_FEATURE_MUTATION } from '@/lib/graphql/features';
import { MutationResponse, Feature, FeatureStatus } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * 機能編集フォームのスキーマ
 */
const featureFormSchema = z.object({
  name: z.string().min(1, '機能名を入力してください'),
  description: z.string().optional(),
  color: z
    .string()
    .optional()
    .refine((val) => !val || /^#[0-9A-Fa-f]{6}$/.test(val), 'カラーコードは#XXXXXXの形式で入力してください'),
  status: z.string(),
});

type FeatureFormData = z.infer<typeof featureFormSchema>;

/**
 * ステータスオプション
 */
const statusOptions = [
  { value: FeatureStatus.PLANNING, label: '計画中' },
  { value: FeatureStatus.DEVELOPING, label: '開発中' },
  { value: FeatureStatus.TESTING, label: 'テスト中' },
  { value: FeatureStatus.COMPLETED, label: '完了' },
  { value: FeatureStatus.ON_HOLD, label: '保留' },
];

/**
 * テスト編集ページ
 *
 * 既存の機能を編集するためのフォームを提供します。
 */
export default function FeatureEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);

  const { data, loading: queryLoading } = useQuery<{ feature: Feature | null }>(GET_FEATURE_QUERY, {
    variables: { id },
    skip: isNaN(id),
  });

  const [updateFeature, { loading: mutationLoading }] = useMutation<{
    updateFeature: MutationResponse<Feature>;
  }>(UPDATE_FEATURE_MUTATION, {
    refetchQueries: [{ query: GET_FEATURES_QUERY }, { query: GET_FEATURE_QUERY, variables: { id } }],
  });

  const form = useForm<FeatureFormData>({
    resolver: zodResolver(featureFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3b82f6',
      status: FeatureStatus.PLANNING,
    },
  });

  const feature = data?.feature;

  // データが取得できたらフォームに設定
  useEffect(() => {
    if (feature) {
      form.reset({
        name: feature.name,
        description: feature.description || '',
        color: feature.color || '#3b82f6',
        status: feature.status,
      });
    }
  }, [feature, form]);

  const onSubmit = async (data: FeatureFormData) => {
    try {
      const result = await updateFeature({
        variables: {
          id,
          name: data.name,
          description: data.description || undefined,
          color: data.color || undefined,
          status: data.status,
        },
      });

      if (result.data?.updateFeature.isValid) {
        toast.success('テストを更新しました', {
          id: 'update-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        router.push(`/features/${id}/tests`);
      } else {
        toast.error(result.data?.updateFeature.message || '更新に失敗しました', {
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

  if (queryLoading) {
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
        <Button variant="ghost" onClick={() => router.push(`/features/${id}/tests`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          詳細に戻る
        </Button>
      </div>

      {/* フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>編集</CardTitle>
          <CardDescription>{`テスト #${id} を編集します`}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 機能名 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      テスト名<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="例: ユーザー認証機能" {...field} />
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
                      <Textarea placeholder="機能の説明を入力" className="min-h-[120px]" {...field} />
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
                  onClick={() => router.push(`/features/${id}/tests`)}
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
