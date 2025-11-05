import { gql } from '@apollo/client';

/**
 * テスト作成ミューテーション
 */
export const CREATE_TEST_MUTATION = gql`
  mutation CreateTest($featureId: Int!, $name: String!, $description: String, $status: String) {
    createTest(createTestInput: { featureId: $featureId, name: $name, description: $description, status: $status }) {
      isValid
      message
      data {
        id
        featureId
        name
        description
        status
        createdById
        createdAt
        updatedAt
        createdBy {
          id
          name
          email
        }
        feature {
          id
          name
          color
        }
      }
    }
  }
`;

/**
 * テスト更新ミューテーション
 */
export const UPDATE_TEST_MUTATION = gql`
  mutation UpdateTest($featureId: Int!, $id: Int!, $name: String, $description: String, $status: String) {
    updateTest(
      updateTestInput: { featureId: $featureId, id: $id, name: $name, description: $description, status: $status }
    ) {
      isValid
      message
      data {
        id
        featureId
        name
        description
        status
        createdById
        createdAt
        updatedAt
        createdBy {
          id
          name
          email
        }
        feature {
          id
          name
          color
        }
      }
    }
  }
`;

/**
 * テスト削除ミューテーション
 */
export const DELETE_TEST_MUTATION = gql`
  mutation DeleteTest($featureId: Int!, $id: Int!) {
    deleteTest(featureId: $featureId, id: $id) {
      isValid
      message
      data {
        id
        name
      }
    }
  }
`;

/**
 * 全テスト取得クエリ
 */
export const GET_TESTS_QUERY = gql`
  query GetTests {
    tests {
      id
      featureId
      name
      description
      status
      createdById
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
      feature {
        id
        name
        color
        status
      }
    }
  }
`;

/**
 * 特定のテスト取得クエリ
 */
export const GET_TEST_QUERY = gql`
  query GetTest($featureId: Int!, $id: Int!) {
    test(featureId: $featureId, id: $id) {
      id
      featureId
      name
      description
      status
      createdById
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
      feature {
        id
        name
        color
        status
      }
    }
  }
`;

/**
 * 機能に属するテスト取得クエリ
 */
export const GET_TESTS_BY_FEATURE_QUERY = gql`
  query GetTestsByFeature($featureId: Int!) {
    testsByFeature(featureId: $featureId) {
      id
      featureId
      name
      description
      status
      createdById
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
    }
  }
`;
