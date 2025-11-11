/**
 * ファイルAPI関連のユーティリティ関数
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface FileUploadResponse {
  id: number;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  featureId: number;
  testId: number;
  testCaseId: number;
  uploadedBy: number;
  createdAt: string;
}

/**
 * ファイルをアップロード
 * @param file - アップロードするファイル
 * @param featureId - 機能ID
 * @param testId - テストID
 * @param testCaseId - テストケースID
 * @returns アップロードされたファイル情報
 */
export async function uploadFile(
  file: File,
  featureId: number,
  testId: number,
  testCaseId: number,
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/files/upload/${featureId}/${testId}/${testCaseId}`, {
    method: 'POST',
    body: formData,
    credentials: 'include', // Cookieを送信
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ファイルアップロードに失敗しました: ${error}`);
  }

  return response.json();
}

/**
 * ファイルをダウンロード
 * @param fileId - ファイルID
 * @param filename - ダウンロード時のファイル名
 */
export async function downloadFile(fileId: number, filename: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
    method: 'GET',
    credentials: 'include', // Cookieを送信
  });

  if (!response.ok) {
    throw new Error('ファイルダウンロードに失敗しました');
  }

  // Blobとしてダウンロード
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * ファイルを削除
 * @param fileId - ファイルID
 * @returns 削除されたファイル情報
 */
export async function deleteFile(fileId: number): Promise<FileUploadResponse> {
  const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
    method: 'DELETE',
    credentials: 'include', // Cookieを送信
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ファイル削除に失敗しました: ${error}`);
  }

  return response.json();
}
