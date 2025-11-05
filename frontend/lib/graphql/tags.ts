import { gql } from '@apollo/client';

/**
 * タグ一覧取得クエリ
 *
 * すべてのタグを取得します。
 *
 * @returns タグの配列
 */
export const GET_TAGS_QUERY = gql`
  query GetTags {
    tags {
      id
      name
      color
      createdAt
    }
  }
`;

/**
 * タグ詳細取得クエリ
 *
 * 指定されたIDのタグを取得します。
 *
 * @param {number} id - タグID
 * @returns タグまたはnull
 */
export const GET_TAG_QUERY = gql`
  query GetTag($id: Int!) {
    tag(id: $id) {
      id
      name
      color
      createdAt
    }
  }
`;

/**
 * タグ作成ミューテーション
 *
 * 新しいタグを作成します。
 *
 * @param {string} name - タグ名
 * @param {string} color - カラーコード（任意）
 * @returns ミューテーションレスポンス
 */
export const CREATE_TAG_MUTATION = gql`
  mutation CreateTag($name: String!, $color: String) {
    createTag(createTagInput: { name: $name, color: $color }) {
      isValid
      message
      data {
        id
        name
        color
        createdAt
      }
    }
  }
`;

/**
 * タグ更新ミューテーション
 *
 * 既存のタグを更新します。
 *
 * @param {number} id - タグID
 * @param {string} name - タグ名（任意）
 * @param {string} color - カラーコード（任意）
 * @returns ミューテーションレスポンス
 */
export const UPDATE_TAG_MUTATION = gql`
  mutation UpdateTag($id: Int!, $name: String, $color: String) {
    updateTag(updateTagInput: { id: $id, name: $name, color: $color }) {
      isValid
      message
      data {
        id
        name
        color
        createdAt
      }
    }
  }
`;

/**
 * タグ削除ミューテーション
 *
 * 指定されたIDのタグを削除します。
 *
 * @param {number} id - タグID
 * @returns ミューテーションレスポンス
 */
export const DELETE_TAG_MUTATION = gql`
  mutation DeleteTag($id: Int!) {
    deleteTag(id: $id) {
      isValid
      message
      data {
        id
      }
    }
  }
`;

/**
 * タグ割り当てミューテーション
 *
 * テストケースにタグを割り当てます。
 *
 * @param {number} testCaseId - テストケースID
 * @param {number} tagId - タグID
 * @returns ミューテーションレスポンス
 */
export const ASSIGN_TAG_MUTATION = gql`
  mutation AssignTag($testCaseId: Int!, $tagId: Int!) {
    assignTag(assignTagInput: { testCaseId: $testCaseId, tagId: $tagId }) {
      isValid
      message
      data {
        id
        tags {
          id
          name
          color
        }
      }
    }
  }
`;

/**
 * タグ割り当て解除ミューテーション
 *
 * テストケースからタグの割り当てを解除します。
 *
 * @param {number} testCaseId - テストケースID
 * @param {number} tagId - タグID
 * @returns ミューテーションレスポンス
 */
export const UNASSIGN_TAG_MUTATION = gql`
  mutation UnassignTag($testCaseId: Int!, $tagId: Int!) {
    unassignTag(testCaseId: $testCaseId, tagId: $tagId) {
      isValid
      message
      data {
        id
        tags {
          id
          name
          color
        }
      }
    }
  }
`;
