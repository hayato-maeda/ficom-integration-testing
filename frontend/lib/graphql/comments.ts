import { gql } from '@apollo/client';

/**
 * コメント作成ミューテーション
 */
export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($createCommentInput: CreateCommentInput!) {
    createComment(createCommentInput: $createCommentInput) {
      isValid
      message
      data {
        id
        content
        featureId
        testId
        testCaseId
        userId
        user {
          id
          name
          email
        }
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * コメント更新ミューテーション
 */
export const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment($updateCommentInput: UpdateCommentInput!) {
    updateComment(updateCommentInput: $updateCommentInput) {
      isValid
      message
      data {
        id
        content
        featureId
        testId
        testCaseId
        userId
        user {
          id
          name
          email
        }
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * コメント削除ミューテーション
 */
export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($id: Int!) {
    deleteComment(id: $id) {
      isValid
      message
      data {
        id
      }
    }
  }
`;

/**
 * テストケースのコメント取得クエリ
 */
export const GET_COMMENTS_BY_TEST_CASE_QUERY = gql`
  query CommentsByTestCase($featureId: Int!, $testId: Int!, $testCaseId: Int!) {
    commentsByTestCase(featureId: $featureId, testId: $testId, testCaseId: $testCaseId) {
      id
      content
      featureId
      testId
      testCaseId
      userId
      user {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;
