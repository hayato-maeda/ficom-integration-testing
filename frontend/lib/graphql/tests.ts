import { gql } from '@apollo/client';

/**
 * テスト一覧取得クエリ
 *
 * すべてのテストを取得します。
 *
 * @returns テストの配列
 */
export const GET_TESTS_QUERY = gql`
  query GetTests {
    tests {
      id
      featureId
      title
      description
      createdAt
      updatedAt
    }
  }
`;

/**
 * テスト詳細取得クエリ
 *
 * 指定されたIDのテストを取得します。
 *
 * @param {number} id - テストID
 * @returns テストまたはnull
 */
export const GET_TEST_QUERY = gql`
  query GetTest($id: Int!) {
    test(id: $id) {
      id
      featureId
      title
      description
      createdAt
      updatedAt
    }
  }
`;

/**
 * テスト作成ミューテーション
 *
 * 新しいテストを作成します。
 *
 * @param {number} featureId - 機能ID
 * @param {string} title - テスト名
 * @param {string} description - 説明（任意）
 * @returns ミューテーションレスポンス
 */
export const CREATE_TEST_MUTATION = gql`
  mutation CreateTest($featureId: Int!, $title: String!, $description: String) {
    createTest(createTestInput: { featureId: $featureId, title: $title, description: $description }) {
      isValid
      message
      data {
        id
        featureId
        title
        description
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * テスト更新ミューテーション
 *
 * 既存のテストを更新します。
 *
 * @param {number} id - テストID
 * @param {string} title - テスト名（任意）
 * @param {string} description - 説明（任意）
 * @returns ミューテーションレスポンス
 */
export const UPDATE_TEST_MUTATION = gql`
  mutation UpdateTest($id: Int!, $title: String, $description: String) {
    updateTest(updateTestInput: { id: $id, title: $title, description: $description }) {
      isValid
      message
      data {
        id
        featureId
        title
        description
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * テスト削除ミューテーション
 *
 * 指定されたIDのテストを削除します。
 *
 * @param {number} id - テストID
 * @returns ミューテーションレスポンス
 */
export const DELETE_TEST_MUTATION = gql`
  mutation DeleteTest($id: Int!) {
    deleteTest(id: $id) {
      isValid
      message
      data {
        id
      }
    }
  }
`;

/**
 * 機能に紐づくテスト一覧取得クエリ
 *
 * 指定された機能IDに紐づくテストを取得します。
 *
 * @param {number} featureId - 機能ID
 * @returns テストの配列
 */
export const GET_TESTS_BY_FEATURE_QUERY = gql`
  query GetTestsByFeature($featureId: Int!) {
    testsByFeature(featureId: $featureId) {
      id
      featureId
      title
      description
      createdAt
      updatedAt
    }
  }
`;

/**
 * テストに紐づくテストケース一覧取得クエリ
 *
 * 指定されたテストIDに紐づくテストケースを取得します。
 *
 * @param {number} testId - テストID
 * @returns テストケースの配列
 */
export const GET_TEST_CASES_BY_TEST_QUERY = gql`
  query GetTestCasesByTest($testId: Int!) {
    testCasesByTest(testId: $testId) {
      id
      testId
      title
      description
      steps
      expectedResult
      actualResult
      status
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
      tags {
        id
        name
        color
      }
    }
  }
`;
