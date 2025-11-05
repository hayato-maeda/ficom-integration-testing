'use client';

import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GET_TEST_CASES_QUERY } from '@/lib/graphql/test-cases';
import { TestCase, TestCaseStatus } from '@/types';
import { Plus, Loader2, Search, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

/**
 * ステータスバッジのスタイルを取得
 */
const getStatusBadgeVariant = (status: string) => {
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
 * ステータスの日本語表示名を取得
 */
const getStatusLabel = (status: string) => {
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
 * テストケース一覧ページ
 *
 * テストケースの一覧を表示し、検索・フィルタリング・作成機能を提供します。
 */
export default function TestCasesPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery<{ testCases: TestCase[] }>(GET_TEST_CASES_QUERY);

  // 検索・フィルタリング状態
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ソート状態（初期値はIDの昇順）
  const [sortColumn, setSortColumn] = useState<'id' | 'title' | 'status' | 'createdBy' | 'createdAt'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // フィルターをクリア
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

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

  // フィルタリングとソートされたテストケースを取得
  const getFilteredAndSortedTestCases = () => {
    if (!data?.testCases) return [];

    // フィルタリング
    const filtered = data.testCases.filter((testCase) => {
      // 検索クエリでフィルタリング（タイトルと説明）
      const matchesSearch =
        !searchQuery ||
        testCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testCase.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // ステータスでフィルタリング
      const matchesStatus = statusFilter === 'all' || testCase.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // ソート
    filtered.sort((a, b) => {
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

    return filtered;
  };

  const filteredTestCases = getFilteredAndSortedTestCases();

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">テストケース</h1>
          <p className="text-muted-foreground">テストケースの管理と実行</p>
        </div>
        <Button onClick={() => router.push('/test-cases/new')}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </div>

      {/* 検索・フィルタリング */}
      <Card>
        <CardHeader>
          <CardTitle>検索・フィルタリング</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-10 md:items-end">
            {/* 検索 */}
            <div className="md:col-span-8">
              <label className="text-sm font-medium">検索</label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="タイトルや説明で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* ステータスフィルター */}
            <div className="md:col-span-1">
              <label className="text-sm font-medium">ステータス</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1.5 min-w-[100px]">
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value={TestCaseStatus.DRAFT}>下書き</SelectItem>
                  <SelectItem value={TestCaseStatus.IN_REVIEW}>レビュー中</SelectItem>
                  <SelectItem value={TestCaseStatus.APPROVED}>承認済み</SelectItem>
                  <SelectItem value={TestCaseStatus.REJECTED}>却下</SelectItem>
                  <SelectItem value={TestCaseStatus.ARCHIVED}>アーカイブ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* クリアボタン */}
            <div className="md:col-span-1">
              <Button variant="outline" onClick={clearFilters} className="mt-1.5 w-full">
                <X className="mr-2 h-4 w-4" />
                クリア
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* テストケース一覧 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>テストケース一覧</CardTitle>
              <CardDescription>
                {filteredTestCases.length > 0
                  ? `${filteredTestCases.length}件のテストケース`
                  : '登録されているテストケースの一覧です'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12 text-destructive">
              <p>エラーが発生しました: {error.message}</p>
            </div>
          )}

          {!loading && !error && data?.testCases && data.testCases.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>テストケースが登録されていません</p>
            </div>
          )}

          {!loading && !error && data?.testCases && data.testCases.length > 0 && filteredTestCases.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>検索条件に一致するテストケースがありません</p>
            </div>
          )}

          {!loading && !error && filteredTestCases.length > 0 && (
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
                  {filteredTestCases.map((testCase) => (
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
                        <Badge variant={getStatusBadgeVariant(testCase.status)}>
                          {getStatusLabel(testCase.status)}
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
