import { gql } from '@apollo/client';

// タグ一覧取得クエリ
export const GET_TAGS_QUERY = gql`
  query GetTags {
    tags {
      id
      name
      color
      createdAt
      updatedAt
    }
  }
`;

// タグ詳細取得クエリ
export const GET_TAG_QUERY = gql`
  query GetTag($id: Int!) {
    tag(id: $id) {
      id
      name
      color
      createdAt
      updatedAt
    }
  }
`;

// タグ作成ミューテーション
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

// タグ更新ミューテーション
export const UPDATE_TAG_MUTATION = gql`
  mutation UpdateTag($id: Int!, $name: String, $color: String) {
    updateTag(id: $id, updateTagInput: { name: $name, color: $color }) {
      isValid
      message
      data {
        id
        name
        color
        updatedAt
      }
    }
  }
`;

// タグ削除ミューテーション
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

// タグ割り当てミューテーション
export const ASSIGN_TAG_MUTATION = gql`
  mutation AssignTag($tagId: Int!, $testCaseId: Int!) {
    assignTag(tagId: $tagId, testCaseId: $testCaseId) {
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

// タグ割り当て解除ミューテーション
export const UNASSIGN_TAG_MUTATION = gql`
  mutation UnassignTag($tagId: Int!, $testCaseId: Int!) {
    unassignTag(tagId: $tagId, testCaseId: $testCaseId) {
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
