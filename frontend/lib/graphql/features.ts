import { gql } from '@apollo/client';

/**
 * 機能一覧取得クエリ
 *
 * すべての機能を取得します。
 *
 * @returns 機能の配列
 */
export const GET_FEATURES_QUERY = gql`
  query GetFeatures {
    features {
      id
      name
      description
      color
      status
      createdAt
      updatedAt
    }
  }
`;

/**
 * 機能詳細取得クエリ
 *
 * 指定されたIDの機能を取得します。
 *
 * @param {number} id - 機能ID
 * @returns 機能またはnull
 */
export const GET_FEATURE_QUERY = gql`
  query GetFeature($id: Int!) {
    feature(id: $id) {
      id
      name
      description
      color
      status
      createdAt
      updatedAt
    }
  }
`;

/**
 * 機能作成ミューテーション
 *
 * 新しい機能を作成します。
 *
 * @param {string} name - 機能名
 * @param {string} description - 説明（任意）
 * @param {string} color - カラーコード（任意）
 * @returns ミューテーションレスポンス
 */
export const CREATE_FEATURE_MUTATION = gql`
  mutation CreateFeature($name: String!, $description: String, $color: String) {
    createFeature(createFeatureInput: { name: $name, description: $description, color: $color }) {
      isValid
      message
      data {
        id
        name
        description
        color
        status
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * 機能更新ミューテーション
 *
 * 既存の機能を更新します。
 *
 * @param {number} id - 機能ID
 * @param {string} name - 機能名（任意）
 * @param {string} description - 説明（任意）
 * @param {string} color - カラーコード（任意）
 * @param {string} status - ステータス（任意）
 * @returns ミューテーションレスポンス
 */
export const UPDATE_FEATURE_MUTATION = gql`
  mutation UpdateFeature($id: Int!, $name: String, $description: String, $color: String, $status: String) {
    updateFeature(updateFeatureInput: { id: $id, name: $name, description: $description, color: $color, status: $status }) {
      isValid
      message
      data {
        id
        name
        description
        color
        status
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * 機能削除ミューテーション
 *
 * 指定されたIDの機能を削除します。
 *
 * @param {number} id - 機能ID
 * @returns ミューテーションレスポンス
 */
export const DELETE_FEATURE_MUTATION = gql`
  mutation DeleteFeature($id: Int!) {
    deleteFeature(id: $id) {
      isValid
      message
      data {
        id
      }
    }
  }
`;

