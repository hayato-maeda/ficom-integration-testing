import { gql } from '@apollo/client';

// テストケース一覧取得クエリ
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

// テストケース詳細取得クエリ
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
      createdAt
      updatedAt
    }
  }
`;

// テストケース作成ミューテーション
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
      }
    }
  }
`;

// テストケース更新ミューテーション
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

// テストケース削除ミューテーション
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
