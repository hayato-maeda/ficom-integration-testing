import { gql } from '@apollo/client';

/**
 * テストケース一覧取得クエリ
 *
 * すべてのテストケースを取得します。
 * タグと作成者の情報も含まれます。
 *
 * @returns テストケースの配列
 */
export const GET_TEST_CASES_QUERY = gql`
  query GetTestCases {
    testCases {
      id
      title
      description
      steps
      expectedResult
      actualResult
      status
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
      createdAt
      updatedAt
    }
  }
`;

/**
 * テストケース詳細取得クエリ
 *
 * 指定されたIDのテストケースを取得します。
 *
 * @param {number} id - テストケースID
 * @returns テストケースまたはnull
 */
export const GET_TEST_CASE_QUERY = gql`
  query GetTestCase($id: Int!) {
    testCase(id: $id) {
      id
      title
      description
      steps
      expectedResult
      actualResult
      status
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
      features {
        id
        name
        description
        color
        status
      }
      createdAt
      updatedAt
    }
  }
`;

/**
 * テストケース作成ミューテーション
 *
 * 新しいテストケースを作成します。
 *
 * @param {string} title - タイトル
 * @param {string} description - 説明（任意）
 * @param {string} steps - テスト手順
 * @param {string} expectedResult - 期待結果
 * @param {string} actualResult - 実績結果（任意）
 * @returns ミューテーションレスポンス
 */
export const CREATE_TEST_CASE_MUTATION = gql`
  mutation CreateTestCase(
    $title: String!
    $description: String
    $steps: String!
    $expectedResult: String!
    $actualResult: String
  ) {
    createTestCase(
      createTestCaseInput: {
        title: $title
        description: $description
        steps: $steps
        expectedResult: $expectedResult
        actualResult: $actualResult
      }
    ) {
      isValid
      message
      data {
        id
        title
        description
        steps
        expectedResult
        actualResult
        status
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * テストケース更新ミューテーション
 *
 * 既存のテストケースを更新します。
 *
 * @param {number} id - テストケースID
 * @param {string} title - タイトル（任意）
 * @param {string} description - 説明（任意）
 * @param {string} steps - テスト手順（任意）
 * @param {string} expectedResult - 期待結果（任意）
 * @param {string} actualResult - 実績結果（任意）
 * @param {string} status - ステータス（任意）
 * @returns ミューテーションレスポンス
 */
export const UPDATE_TEST_CASE_MUTATION = gql`
  mutation UpdateTestCase(
    $id: Int!
    $title: String
    $description: String
    $steps: String
    $expectedResult: String
    $actualResult: String
    $status: String
  ) {
    updateTestCase(
      updateTestCaseInput: {
        id: $id
        title: $title
        description: $description
        steps: $steps
        expectedResult: $expectedResult
        actualResult: $actualResult
        status: $status
      }
    ) {
      isValid
      message
      data {
        id
        title
        description
        steps
        expectedResult
        actualResult
        status
        updatedAt
      }
    }
  }
`;

/**
 * テストケース削除ミューテーション
 *
 * 指定されたIDのテストケースを削除します。
 *
 * @param {number} id - テストケースID
 * @returns ミューテーションレスポンス
 */
export const DELETE_TEST_CASE_MUTATION = gql`
  mutation DeleteTestCase($id: Int!) {
    deleteTestCase(id: $id) {
      isValid
      message
      data {
        id
      }
    }
  }
`;
