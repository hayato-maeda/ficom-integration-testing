import { gql } from '@apollo/client';

/**
 * 承認作成ミューテーション
 */
export const CREATE_APPROVAL_MUTATION = gql`
  mutation CreateApproval($input: CreateApprovalInput!) {
    createApproval(input: $input) {
      isValid
      message
      data {
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
    }
  }
`;

/**
 * 承認更新ミューテーション
 */
export const UPDATE_APPROVAL_MUTATION = gql`
  mutation UpdateApproval($input: UpdateApprovalInput!) {
    updateApproval(input: $input) {
      isValid
      message
      data {
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
    }
  }
`;

/**
 * 承認削除ミューテーション
 */
export const DELETE_APPROVAL_MUTATION = gql`
  mutation DeleteApproval($id: Int!) {
    deleteApproval(id: $id) {
      isValid
      message
      data {
        id
      }
    }
  }
`;

/**
 * テストケースの承認履歴取得クエリ
 */
export const GET_APPROVALS_BY_TEST_CASE_QUERY = gql`
  query ApprovalsByTestCase($featureId: Int!, $testId: Int!, $testCaseId: Int!) {
    approvalsByTestCase(featureId: $featureId, testId: $testId, testCaseId: $testCaseId) {
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
  }
`;
