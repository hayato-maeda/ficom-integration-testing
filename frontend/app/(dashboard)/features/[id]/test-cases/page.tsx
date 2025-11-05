'use client';

import { useQuery } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GET_FEATURE_QUERY, GET_TEST_CASES_BY_FEATURE_QUERY } from '@/lib/graphql/features';
import { Feature, TestCase, FeatureStatus, TestCaseStatus } from '@/types';
import { ArrowLeft, Loader2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

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

  const feature = featureData?.feature;
  const testCases = testCasesData?.testCasesByFeature || [];
  const loading = featureLoading || testCasesLoading;

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
          <CardTitle>テストケース一覧</CardTitle>
          <CardDescription>
            {testCases.length > 0
              ? `${testCases.length}件のテストケースがこの機能に紐づいています`
              : 'この機能に紐づくテストケースはありません'}
          </CardDescription>
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
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>タイトル</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>タグ</TableHead>
                    <TableHead>作成者</TableHead>
                    <TableHead>作成日</TableHead>
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
    </div>
  );
}
