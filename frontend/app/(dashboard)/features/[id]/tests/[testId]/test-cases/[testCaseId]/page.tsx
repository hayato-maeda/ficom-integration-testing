'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GET_TEST_CASE_QUERY, DELETE_TEST_CASE_MUTATION } from '@/lib/graphql/test-cases';
import { GET_TAGS_QUERY, ASSIGN_TAG_MUTATION, UNASSIGN_TAG_MUTATION } from '@/lib/graphql/tags';
import { uploadFile, downloadFile, deleteFile } from '@/lib/api/files';
import { MutationResponse, TestCase, TestCaseStatus, Tag } from '@/types';
import { ArrowLeft, Loader2, Pencil, Trash2, Plus, X, Upload, Download, FileIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { toast } from 'sonner';

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
 * ファイルが画像かどうかを判定
 */
const isImageFile = (mimeType: string) => {
  return mimeType.startsWith('image/');
};

/**
 * 画像ファイルのURLを取得
 */
const getImageUrl = (fileId: number) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return `${API_BASE_URL}/files/${fileId}/view`;
};

/**
 * テストケース詳細ページ
 *
 * テストケースの詳細情報を表示します。
 * 編集・削除機能を提供します。
 */
export default function TestCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const featureId = parseInt(params.id as string, 10);
  const testId = parseInt(params.testId as string, 10);
  const testCaseId = parseInt(params.testCaseId as string, 10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addTagDialogOpen, setAddTagDialogOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [previewImageId, setPreviewImageId] = useState<number | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');

  const { data, loading, error, refetch } = useQuery<{ testCase: TestCase | null }>(GET_TEST_CASE_QUERY, {
    variables: { featureId, testId, id: testCaseId },
    skip: isNaN(featureId) || isNaN(testId) || isNaN(testCaseId),
  });

  const { data: tagsData } = useQuery<{ tags: Tag[] }>(GET_TAGS_QUERY);

  const [deleteTestCase, { loading: deleteLoading }] = useMutation<{
    deleteTestCase: MutationResponse<TestCase>;
  }>(DELETE_TEST_CASE_MUTATION);

  const [assignTag, { loading: assignLoading }] = useMutation<{
    assignTag: MutationResponse<null>;
  }>(ASSIGN_TAG_MUTATION, {
    refetchQueries: [{ query: GET_TEST_CASE_QUERY, variables: { featureId, testId, id: testCaseId } }],
  });

  const [unassignTag, { loading: unassignLoading }] = useMutation<{
    unassignTag: MutationResponse<null>;
  }>(UNASSIGN_TAG_MUTATION, {
    refetchQueries: [{ query: GET_TEST_CASE_QUERY, variables: { featureId, testId, id: testCaseId } }],
  });

  const testCase = data?.testCase;
  const allTags = tagsData?.tags || [];

  // 未割り当てのタグを取得
  const unassignedTags = allTags.filter(
    (tag) => !testCase?.tags?.some((t) => t.id === tag.id)
  );

  const handleDelete = async () => {
    try {
      const result = await deleteTestCase({
        variables: { featureId, testId, id: testCaseId },
      });

      if (result.data?.deleteTestCase.isValid) {
        toast.success('テストケースを削除しました', {
          id: 'delete-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        router.push(`/features/${featureId}/tests/${testId}/test-cases`);
      } else {
        toast.error(result.data?.deleteTestCase.message || '削除に失敗しました', {
          id: 'delete-error',
          style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
        });
      }
    } catch (_error) {
      toast.error('エラーが発生しました', {
        id: 'delete-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleAddTag = async () => {
    if (!selectedTagId) return;

    try {
      const result = await assignTag({
        variables: {
          featureId,
          testId,
          testCaseId,
          tagId: parseInt(selectedTagId, 10),
        },
      });

      if (result.data?.assignTag.isValid) {
        toast.success('タグを追加しました', {
          id: 'assign-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
        setAddTagDialogOpen(false);
        setSelectedTagId('');
      } else {
        toast.error(result.data?.assignTag.message || 'タグの追加に失敗しました', {
          id: 'assign-error',
          style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
        });
      }
    } catch (_error) {
      toast.error('エラーが発生しました', {
        id: 'assign-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      const result = await unassignTag({
        variables: {
          featureId,
          testId,
          testCaseId,
          tagId,
        },
      });

      if (result.data?.unassignTag.isValid) {
        toast.success('タグを削除しました', {
          id: 'unassign-success',
          style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
        });
      } else {
        toast.error(result.data?.unassignTag.message || 'タグの削除に失敗しました', {
          id: 'unassign-error',
          style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
        });
      }
    } catch (_error) {
      toast.error('エラーが発生しました', {
        id: 'unassign-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('ファイルサイズは10MB以下にしてください', {
        id: 'file-size-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
      event.target.value = '';
      return;
    }

    setUploadingFile(true);
    try {
      await uploadFile(file, featureId, testId, testCaseId);
      toast.success('ファイルをアップロードしました', {
        id: 'upload-success',
        style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
      });
      // データを再取得
      await refetch();
      event.target.value = '';
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ファイルのアップロードに失敗しました', {
        id: 'upload-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileDownload = async (fileId: number, filename: string) => {
    try {
      await downloadFile(fileId, filename);
      toast.success('ファイルをダウンロードしました', {
        id: 'download-success',
        style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
      });
    } catch (error) {
      toast.error('ファイルのダウンロードに失敗しました', {
        id: 'download-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    }
  };

  const handleFileDelete = async (fileId: number) => {
    setDeletingFileId(fileId);
    try {
      await deleteFile(fileId);
      toast.success('ファイルを削除しました', {
        id: 'delete-file-success',
        style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
      });
      // データを再取得
      await refetch();
    } catch (error) {
      toast.error('ファイルの削除に失敗しました', {
        id: 'delete-file-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleImageClick = (fileId: number, filename: string) => {
    setPreviewImageId(fileId);
    setPreviewImageUrl(getImageUrl(fileId));
  };

  /**
   * テキスト内の画像記法を解析してReactノードに変換
   * [[image:fileId]] を <img> タグに変換
   */
  const renderTextWithImages = (text: string | undefined | null) => {
    if (!text) return null;

    const parts: (string | JSX.Element)[] = [];
    const imagePattern = /\[\[image:(\d+)\]\]/g;
    let lastIndex = 0;
    let match;

    while ((match = imagePattern.exec(text)) !== null) {
      // マッチ前のテキストを追加
      if (match.index > lastIndex) {
        const textPart = text.substring(lastIndex, match.index);
        parts.push(
          ...textPart.split('\n').flatMap((line, i) => (i > 0 ? [<br key={`br-${lastIndex}-${i}`} />, line] : [line]))
        );
      }

      // 画像を追加
      const fileId = parseInt(match[1], 10);
      parts.push(
        <img
          key={`image-${fileId}-${match.index}`}
          src={getImageUrl(fileId)}
          alt={`Image ${fileId}`}
          className="max-w-md h-auto my-2 rounded border cursor-pointer"
          onClick={() => handleImageClick(fileId, `Image ${fileId}`)}
        />
      );

      lastIndex = imagePattern.lastIndex;
    }

    // 残りのテキストを追加
    if (lastIndex < text.length) {
      const textPart = text.substring(lastIndex);
      parts.push(
        ...textPart.split('\n').flatMap((line, i) => (i > 0 ? [<br key={`br-${lastIndex}-${i}`} />, line] : [line]))
      );
    }

    return parts.length > 0 ? <>{parts}</> : null;
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

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push(`/features/${featureId}/tests/${testId}/test-cases`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          テストケース一覧に戻る
        </Button>
        {testCase && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/features/${featureId}/tests/${testId}/test-cases/${testCaseId}/edit`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              編集
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)} disabled={deleteLoading}>
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </Button>
          </div>
        )}
      </div>

      {/* ローディング状態 */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {/* エラー状態 */}
      {error && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-destructive">エラーが発生しました: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* テストケースが見つからない */}
      {!loading && !error && !testCase && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">テストケースが見つかりませんでした</p>
          </CardContent>
        </Card>
      )}

      {/* テストケース詳細 */}
      {!loading && !error && testCase && (
        <div className="space-y-6">
          {/* タイトルとステータス */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl">{testCase.title}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(testCase.status)}>{getStatusLabel(testCase.status)}</Badge>
                  </div>
                  <CardDescription>ID: {testCase.id}</CardDescription>
                </div>
              </div>
            </CardHeader>
            {testCase.description && (
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">説明</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{testCase.description}</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* テスト詳細 */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* テスト手順 */}
            <Card>
              <CardHeader>
                <CardTitle>テスト手順</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{testCase.steps}</p>
              </CardContent>
            </Card>

            {/* 期待結果 */}
            <Card>
              <CardHeader>
                <CardTitle>期待結果</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{testCase.expectedResult}</p>
              </CardContent>
            </Card>
          </div>

          {/* 実績結果 */}
          {testCase.actualResult && (
            <Card>
              <CardHeader>
                <CardTitle>実績結果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">{renderTextWithImages(testCase.actualResult)}</div>
              </CardContent>
            </Card>
          )}

          {/* タグ、機能、作成者情報 */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* タグ */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>タグ</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddTagDialogOpen(true)}
                    disabled={assignLoading || unassignLoading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    タグを追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {testCase.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {testCase.tags.map((tag, tagIndex) => (
                      <Badge
                        key={`${testCase.featureId}-${testCase.testId}-${testCase.id}-${tag.id}-${tagIndex}`}
                        variant="outline"
                        style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                        className="pr-1"
                      >
                        {tag.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleRemoveTag(tag.id)}
                          disabled={unassignLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">タグが設定されていません</p>
                )}
              </CardContent>
            </Card>

            {/* 作成者情報 */}
            <Card>
              <CardHeader>
                <CardTitle>作成者情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">作成者</p>
                  <p className="text-sm text-muted-foreground">{testCase.createdBy.name}</p>
                  <p className="text-sm text-muted-foreground">{testCase.createdBy.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">作成日</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(testCase.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">更新日</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(testCase.updatedAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 添付ファイル */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>添付ファイル</CardTitle>
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={uploadingFile}
                  >
                    {uploadingFile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        アップロード中...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        ファイルを追加
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {testCase.files && testCase.files.length > 0 ? (
                <div className="space-y-2">
                  {testCase.files.map((file) => {
                    const isImage = isImageFile(file.mimeType);
                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {isImage ? (
                            <div
                              className="w-16 h-16 flex-shrink-0 rounded overflow-hidden cursor-pointer border"
                              onClick={() => handleImageClick(file.id, file.filename)}
                            >
                              <img
                                src={getImageUrl(file.id)}
                                alt={file.filename}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.filename}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{(file.size / 1024).toFixed(2)} KB</span>
                              <span>•</span>
                              <span>{file.uploader.name}</span>
                              <span>•</span>
                              <span>{format(new Date(file.createdAt), 'yyyy/MM/dd HH:mm')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleFileDownload(file.id, file.filename)}
                            title="ダウンロード"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleFileDelete(file.id)}
                            disabled={deletingFileId === file.id}
                            title="削除"
                          >
                            {deletingFileId === file.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">添付ファイルはありません</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>テストケースを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。テストケース「{testCase?.title}」を完全に削除します。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* タグ追加ダイアログ */}
      <Dialog open={addTagDialogOpen} onOpenChange={setAddTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タグを追加</DialogTitle>
            <DialogDescription>このテストケースに割り当てるタグを選択してください</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {unassignedTags.length > 0 ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">タグを選択</label>
                <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                  <SelectTrigger>
                    <SelectValue placeholder="タグを選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedTags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id.toString()}>
                        <div className="flex items-center gap-2">
                          {tag.color && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }} />}
                          <span>{tag.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">すべてのタグが割り当て済みです</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddTagDialogOpen(false);
                setSelectedTagId('');
              }}
              disabled={assignLoading}
            >
              キャンセル
            </Button>
            <Button onClick={handleAddTag} disabled={!selectedTagId || assignLoading}>
              {assignLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 画像プレビューダイアログ */}
      <Dialog open={previewImageId !== null} onOpenChange={() => setPreviewImageId(null)}>
        <DialogContent className="max-w-[90vw] max-h-[95vh]">
          <DialogHeader>
            <DialogTitle>画像プレビュー</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 overflow-auto">
            {previewImageUrl && (
              <img src={previewImageUrl} alt="Preview" className="max-w-full max-h-[80vh] object-contain" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewImageId(null)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
