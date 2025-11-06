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
 * @param {number} featureId - 機能ID
 * @param {number} testId - テストID
 * @param {number} id - テストケースID
 * @returns テストケースまたはnull
 */
export const GET_TEST_CASE_QUERY = gql`
  query GetTestCase($featureId: Int!, $testId: Int!, $id: Int!) {
    testCase(featureId: $featureId, testId: $testId, id: $id) {
      id
      featureId
      testId
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
      files {
        id
        filename
        path
        mimeType
        size
        uploader {
          id
          name
          email
        }
        createdAt
      }
      approvals {
        id
        featureId
        testId
        testCaseId
        userId
        user {
          id
          name
          email
        }
        status
        comment
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;

/**
 * Testに属するTestCase一覧取得クエリ
 */
export const GET_TEST_CASES_BY_TEST_QUERY = gql`
  query GetTestCasesByTest($featureId: Int!, $testId: Int!) {
    testCasesByTest(featureId: $featureId, testId: $testId) {
      id
      featureId
      testId
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
 * テストケース作成ミューテーション
 *
 * 新しいテストケースを作成します。
 *
 * @param {number} featureId - 機能ID
 * @param {number} testId - テストID
 * @param {string} title - タイトル
 * @param {string} description - 説明（任意）
 * @param {string} steps - テスト手順
 * @param {string} expectedResult - 期待結果
 * @param {string} actualResult - 実績結果（任意）
 * @returns ミューテーションレスポンス
 */
export const CREATE_TEST_CASE_MUTATION = gql`
  mutation CreateTestCase(
    $featureId: Int!
    $testId: Int!
    $title: String!
    $description: String
    $steps: String!
    $expectedResult: String!
    $actualResult: String
  ) {
    createTestCase(
      createTestCaseInput: {
        featureId: $featureId
        testId: $testId
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
        featureId
        testId
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
 * @param {number} featureId - 機能ID
 * @param {number} testId - テストID
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
    $featureId: Int!
    $testId: Int!
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
        featureId: $featureId
        testId: $testId
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
        featureId
        testId
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
 * @param {number} featureId - 機能ID
 * @param {number} testId - テストID
 * @param {number} id - テストケースID
 * @returns ミューテーションレスポンス
 */
export const DELETE_TEST_CASE_MUTATION = gql`
  mutation DeleteTestCase($featureId: Int!, $testId: Int!, $id: Int!) {
    deleteTestCase(featureId: $featureId, testId: $testId, id: $id) {
      isValid
      message
      data {
        id
      }
    }
  }
`;
