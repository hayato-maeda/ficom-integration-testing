# ファイル添付API ドキュメント

テストケースにファイルを添付するためのファイル管理APIドキュメントです。

## 概要

このモジュールは、ファイルのアップロード、ダウンロード、照会、削除機能を提供します。スクリーンショットやログファイルなどをテストケースに添付できます。

## API一覧

### クイックリファレンス

| API | 種類 | 認証 | 説明 |
|-----|------|------|------|
| [POST /files/upload/:testCaseId](#post-filesuploadtestcaseid---ファイルアップロード) | REST | ✅ 必要 | ファイルアップロード |
| [GET /files/:id/download](#get-filesiddownload---ファイルダウンロード) | REST | ✅ 必要 | ファイルダウンロード |
| [DELETE /files/:id](#delete-filesid---ファイル削除) | REST | ✅ 必要 | ファイル削除 |
| [files](#files---ファイル一覧取得) | Query | ✅ 必要 | ファイル一覧取得 |
| [file](#file---ファイル取得) | Query | ✅ 必要 | ファイル取得 |
| [filesByTestCase](#filesbytestcase---テストケースのファイル取得) | Query | ✅ 必要 | テストケースのファイル一覧取得 |

---

## POST /files/upload/:testCaseId - ファイルアップロード

テストケースにファイルをアップロードします。

**エンドポイント**: `POST /files/upload/:testCaseId`

**認証**: JWT トークン（Bearer）

**Content-Type**: `multipart/form-data`

**パラメータ**:
- `testCaseId` (パスパラメータ): テストケースID

**リクエストボディ**:
- `file` (multipart): アップロードするファイル

**制限**:
- 最大ファイルサイズ: 10MB

**curlコマンド例**:
```bash
curl -X POST http://localhost:4000/files/upload/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.png"
```

**レスポンス例**:
```json
{
  "id": 1,
  "filename": "screenshot.png",
  "path": "screenshot-1634567890123-987654321.png",
  "mimeType": "image/png",
  "size": 524288,
  "testCaseId": 1,
  "uploadedBy": 1,
  "createdAt": "2025-10-29T12:34:56.789Z",
  "testCase": {
    "id": 1,
    "title": "ログイン機能のテスト"
  },
  "uploader": {
    "id": 1,
    "name": "山田太郎",
    "email": "yamada@example.com"
  }
}
```

**エラー**:
- ファイルが未指定の場合: `BadRequestException`
- ファイルサイズが10MBを超える場合: `PayloadTooLargeException`
- テストケースが存在しない場合: `NotFoundException`

---

## GET /files/:id/download - ファイルダウンロード

ファイルをダウンロードします。

**エンドポイント**: `GET /files/:id/download`

**認証**: JWT トークン（Bearer）

**パラメータ**:
- `id` (パスパラメータ): ファイルID

**curlコマンド例**:
```bash
curl -X GET http://localhost:4000/files/1/download \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -O
```

**レスポンス**:
- ファイルのバイナリデータ
- `Content-Type`: ファイルのMIMEタイプ
- `Content-Disposition`: `attachment; filename="元のファイル名"`

**エラー**:
- ファイルが存在しない場合: `NotFoundException`

---

## DELETE /files/:id - ファイル削除

ファイルを削除します。

**エンドポイント**: `DELETE /files/:id`

**認証**: JWT トークン（Bearer）

**パラメータ**:
- `id` (パスパラメータ): ファイルID

**curlコマンド例**:
```bash
curl -X DELETE http://localhost:4000/files/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**レスポンス例**:
```json
{
  "id": 1,
  "filename": "screenshot.png",
  "path": "screenshot-1634567890123-987654321.png",
  "mimeType": "image/png",
  "size": 524288,
  "testCaseId": 1,
  "uploadedBy": 1,
  "createdAt": "2025-10-29T12:34:56.789Z"
}
```

**エラー**:
- ファイルが存在しない場合: `NotFoundException`

---

## files - ファイル一覧取得

すべてのファイルを取得します。作成日時の降順でソートされます。

**GraphQL**:
```graphql
query Files {
  files {
    id
    filename
    path
    mimeType
    size
    testCaseId
    uploadedBy
    createdAt
    testCase {
      id
      title
    }
    uploader {
      id
      name
      email
    }
  }
}
```

---

## file - ファイル取得

特定のファイルを取得します。

**GraphQL**:
```graphql
query File($id: Int!) {
  file(id: $id) {
    id
    filename
    path
    mimeType
    size
    testCaseId
    uploadedBy
    createdAt
    testCase {
      id
      title
    }
    uploader {
      id
      name
      email
    }
  }
}
```

**Variables**:
```json
{
  "id": "1"
}
```

---

## filesByTestCase - テストケースのファイル取得

特定のテストケースに添付されているファイルを取得します。

**GraphQL**:
```graphql
query FilesByTestCase($testCaseId: Int!) {
  filesByTestCase(testCaseId: $testCaseId) {
    id
    filename
    path
    mimeType
    size
    uploadedBy
    createdAt
    uploader {
      id
      name
      email
    }
  }
}
```

**Variables**:
```json
{
  "testCaseId": "1"
}
```

---

## テストケースからのファイル取得

テストケース取得時に、自動的にファイルも取得できます。

**GraphQL**:
```graphql
query TestCase($id: Int!) {
  testCase(id: $id) {
    id
    title
    files {
      id
      filename
      mimeType
      size
      createdAt
      uploader {
        id
        name
      }
    }
  }
}
```

---

## データモデル

### File

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | Int | ✓ | ファイルID（自動採番） |
| filename | String | ✓ | 元のファイル名 |
| path | String | ✓ | サーバー上の保存パス |
| mimeType | String | ✓ | MIMEタイプ（例: image/png） |
| size | Int | ✓ | ファイルサイズ（バイト） |
| testCaseId | Int | ✓ | テストケースID |
| uploadedBy | Int | ✓ | アップロードユーザーID |
| testCase | TestCase | ✓ | テストケース |
| uploader | User | ✓ | アップロードユーザー |
| createdAt | DateTime | ✓ | 作成日時 |

**制約**:
- `testCaseId`: 外部キー制約（TestCase）、カスケード削除
- `uploadedBy`: 外部キー制約（User）
- ファイルサイズ上限: 10MB

---

## 使用例

### 完全なワークフロー（REST API）

```typescript
// 1. ファイルアップロード
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadResponse = await fetch('http://localhost:4000/files/upload/1', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const uploadedFile = await uploadResponse.json();
console.log('Uploaded:', uploadedFile);

// 2. ファイルダウンロード
const downloadResponse = await fetch(`http://localhost:4000/files/${uploadedFile.id}/download`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const blob = await downloadResponse.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = uploadedFile.filename;
a.click();

// 3. ファイル削除
await fetch(`http://localhost:4000/files/${uploadedFile.id}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### GraphQLでのファイル照会

```typescript
import { gql, useQuery } from '@apollo/client';

// テストケースのファイル一覧取得
const GET_TEST_CASE_FILES = gql`
  query TestCaseWithFiles($id: Int!) {
    testCase(id: $id) {
      id
      title
      files {
        id
        filename
        mimeType
        size
        createdAt
        uploader {
          id
          name
        }
      }
    }
  }
`;

const { data } = useQuery(GET_TEST_CASE_FILES, {
  variables: { id: '1' }
});
```

---

## サポートされているファイル形式

### 推奨ファイル形式

| カテゴリ | MIME Type | 拡張子 | 用途 |
|---------|-----------|--------|------|
| 画像 | image/png | .png | スクリーンショット |
| 画像 | image/jpeg | .jpg, .jpeg | 写真 |
| 画像 | image/gif | .gif | アニメーション画像 |
| ドキュメント | application/pdf | .pdf | レポート |
| テキスト | text/plain | .txt | ログファイル |
| テキスト | text/csv | .csv | データファイル |
| 圧縮 | application/zip | .zip | 複数ファイル |
| 動画 | video/mp4 | .mp4 | 操作動画 |

**注意**: 10MBを超えるファイルはアップロードできません。

---

## エラーハンドリング

| エラー | コード | 原因 | 対処方法 |
|--------|--------|------|---------|
| 認証エラー | UNAUTHENTICATED | トークン無効 | 再ログインまたはトークンリフレッシュ |
| ファイル未指定 | BAD_REQUEST | ファイルが選択されていない | ファイルを選択してから送信 |
| ファイルサイズ超過 | PAYLOAD_TOO_LARGE | 10MB超過 | ファイルサイズを削減 |
| 存在しないリソース | NOT_FOUND | ファイルまたはテストケースが存在しない | IDの確認 |

---

## ベストプラクティス

### 1. ファイル命名規則

```
✅ 良い例:
- login-test-screenshot.png
- error-log-2025-10-29.txt
- test-data.csv

❌ 悪い例:
- 画像1.png
- file.txt
- test.jpg
```

### 2. ファイルサイズの最適化

- スクリーンショットは必要な部分のみトリミング
- 動画は必要最小限の長さに編集
- 圧縮可能なファイルは事前に圧縮

### 3. セキュリティ

- アップロード前にファイルタイプを検証
- ダウンロード時は適切なContent-Typeを設定
- 不要なファイルは定期的に削除

---

## ファイル保存先

ファイルは `backend/uploads/` ディレクトリに保存されます。

**ファイル名形式**: `{元のファイル名（拡張子除く）}-{タイムスタンプ}-{ランダム番号}.{拡張子}`

例: `screenshot-1634567890123-987654321.png`

---

## 権限管理

### アップロード
- すべての認証済みユーザーが実行可能

### ダウンロード
- すべての認証済みユーザーが実行可能

### 削除
- すべての認証済みユーザーが実行可能
- 今後、アップロード者のみに制限する可能性あり

---

## 関連ドキュメント

- [全体ドキュメント](../README.md) - バックエンド全体の概要
- [テストケースAPI](../test-cases/) - テストケース管理
- [認証API](../auth/) - 認証関連のAPI

---

**最終更新**: 2025-10-29
**バージョン**: 1.0.0
