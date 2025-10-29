# タグ管理API ドキュメント

テストケースを分類・整理するためのタグ管理APIドキュメントです。

## 概要

このモジュールは、タグのCRUD操作とテストケースへの割り当て機能を提供します。タグを使用してテストケースをカテゴリ分類し、検索やフィルタリングを容易にします。

## API一覧

### クイックリファレンス

| API | 種類 | 認証 | 説明 |
|-----|------|------|------|
| [createTag](#createtag---タグ作成) | Mutation | ✅ 必要 | タグ作成 |
| [tags](#tags---タグ一覧取得) | Query | ✅ 必要 | タグ一覧取得 |
| [tag](#tag---タグ取得) | Query | ✅ 必要 | タグ取得 |
| [updateTag](#updatetag---タグ更新) | Mutation | ✅ 必要 | タグ更新 |
| [deleteTag](#deletetag---タグ削除) | Mutation | ✅ 必要 | タグ削除 |
| [assignTag](#assigntag---タグ割り当て) | Mutation | ✅ 必要 | テストケースへのタグ割り当て |
| [unassignTag](#unassigntag---タグ削除) | Mutation | ✅ 必要 | テストケースからのタグ削除 |
| [tagsByTestCase](#tagsbytestcase---テストケースのタグ取得) | Query | ✅ 必要 | テストケースのタグ一覧取得 |

---

## createTag - タグ作成

新しいタグを作成します。

**GraphQL**:
```graphql
mutation CreateTag($createTagInput: CreateTagInput!) {
  createTag(createTagInput: $createTagInput) {
    id
    name
    color
    createdAt
  }
}
```

**Variables**:
```json
{
  "createTagInput": {
    "name": "バグ",
    "color": "#FF5733"
  }
}
```

**エラー**:
- タグ名が既に存在する場合: `ConflictException`

---

## tags - タグ一覧取得

すべてのタグを取得します。名前順（昇順）でソートされます。

**GraphQL**:
```graphql
query Tags {
  tags {
    id
    name
    color
    createdAt
  }
}
```

---

## tag - タグ取得

特定のタグを取得します。

**GraphQL**:
```graphql
query Tag($id: ID!) {
  tag(id: $id) {
    id
    name
    color
    createdAt
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

## updateTag - タグ更新

既存のタグを更新します。

**GraphQL**:
```graphql
mutation UpdateTag($updateTagInput: UpdateTagInput!) {
  updateTag(updateTagInput: $updateTagInput) {
    id
    name
    color
    createdAt
  }
}
```

**Variables**:
```json
{
  "updateTagInput": {
    "id": "1",
    "name": "重大なバグ",
    "color": "#FF0000"
  }
}
```

**エラー**:
- 変更後のタグ名が既に存在する場合: `ConflictException`

---

## deleteTag - タグ削除

タグを削除します。テストケースへの割り当ても削除されます（カスケード削除）。

**GraphQL**:
```graphql
mutation DeleteTag($id: ID!) {
  deleteTag(id: $id) {
    id
    name
  }
}
```

---

## assignTag - タグ割り当て

テストケースにタグを割り当てます。

**GraphQL**:
```graphql
mutation AssignTag($assignTagInput: AssignTagInput!) {
  assignTag(assignTagInput: $assignTagInput)
}
```

**Variables**:
```json
{
  "assignTagInput": {
    "testCaseId": "1",
    "tagId": "2"
  }
}
```

**エラー**:
- 既に割り当て済みの場合: `ConflictException`
- テストケースまたはタグが存在しない場合: `NotFoundException`

---

## unassignTag - タグ削除

テストケースからタグを削除します。

**GraphQL**:
```graphql
mutation UnassignTag($testCaseId: ID!, $tagId: ID!) {
  unassignTag(testCaseId: $testCaseId, tagId: $tagId)
}
```

**Variables**:
```json
{
  "testCaseId": "1",
  "tagId": "2"
}
```

---

## tagsByTestCase - テストケースのタグ取得

特定のテストケースに割り当てられているタグを取得します。

**GraphQL**:
```graphql
query TagsByTestCase($testCaseId: ID!) {
  tagsByTestCase(testCaseId: $testCaseId) {
    id
    name
    color
  }
}
```

---

## テストケースからのタグ取得

テストケース取得時に、自動的にタグも取得できます。

**GraphQL**:
```graphql
query TestCase($id: ID!) {
  testCase(id: $id) {
    id
    title
    tags {
      id
      name
      color
    }
  }
}
```

---

## データモデル

### Tag

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | ID | ✓ | タグID（自動採番） |
| name | String | ✓ | タグ名（一意） |
| color | String | | カラーコード（例: #FF5733） |
| createdAt | DateTime | ✓ | 作成日時 |

**制約**:
- `name`: 一意性制約あり
- `color`: 16進数カラーコード形式（#RRGGBB）

---

## 使用例

### 完全なワークフロー

```typescript
import { gql, useMutation, useQuery } from '@apollo/client';

// 1. タグ作成
const CREATE_TAG = gql`
  mutation CreateTag($createTagInput: CreateTagInput!) {
    createTag(createTagInput: $createTagInput) {
      id
      name
      color
    }
  }
`;

const [createTag] = useMutation(CREATE_TAG);

await createTag({
  variables: {
    createTagInput: {
      name: 'バグ',
      color: '#FF5733'
    }
  }
});

// 2. テストケースにタグを割り当て
const ASSIGN_TAG = gql`
  mutation AssignTag($assignTagInput: AssignTagInput!) {
    assignTag(assignTagInput: $assignTagInput)
  }
`;

const [assignTag] = useMutation(ASSIGN_TAG);

await assignTag({
  variables: {
    assignTagInput: {
      testCaseId: '1',
      tagId: '2'
    }
  }
});

// 3. テストケースのタグを取得
const GET_TEST_CASE_WITH_TAGS = gql`
  query TestCase($id: ID!) {
    testCase(id: $id) {
      id
      title
      tags {
        id
        name
        color
      }
    }
  }
`;

const { data } = useQuery(GET_TEST_CASE_WITH_TAGS, {
  variables: { id: '1' }
});
```

---

## カラーコードの推奨値

| カテゴリ | カラーコード | 用途例 |
|---------|------------|--------|
| 赤 | #FF5733 | バグ、エラー |
| オレンジ | #FFA500 | 警告、注意 |
| 黄色 | #FFD700 | 保留、確認中 |
| 緑 | #28A745 | 正常、完了 |
| 青 | #007BFF | 機能、新規 |
| 紫 | #6F42C1 | 改善、強化 |
| グレー | #6C757D | その他 |

---

## エラーハンドリング

| エラー | コード | 原因 | 対処方法 |
|--------|--------|------|---------|
| 認証エラー | UNAUTHENTICATED | トークン無効 | 再ログインまたはトークンリフレッシュ |
| 重複エラー | CONFLICT | タグ名が既に存在 | 別の名前を使用 |
| 存在しないリソース | NOT_FOUND | タグまたはテストケースが存在しない | IDの確認 |
| バリデーションエラー | BAD_USER_INPUT | 不正なカラーコード | 正しい形式（#RRGGBB）を使用 |

---

## ベストプラクティス

### 1. タグ命名規則

```
✅ 良い例:
- バグ
- 機能追加
- パフォーマンス改善
- UI/UX

❌ 悪い例:
- tag1
- test
- その他
```

### 2. カラーの一貫性

同じカテゴリのタグには同系色を使用し、視覚的に分かりやすくします。

### 3. タグの再利用

既存のタグを積極的に再利用し、タグの数が増えすぎないようにします。

---

## 権限管理

### すべての操作
- すべての認証済みユーザーが実行可能
- タグは共有リソースとして扱われます

---

## 関連ドキュメント

- [全体ドキュメント](../README.md) - バックエンド全体の概要
- [テストケースAPI](../test-cases/) - テストケース管理
- [認証API](../auth/) - 認証関連のAPI

---

**最終更新**: 2025-10-29
**バージョン**: 1.0.0
