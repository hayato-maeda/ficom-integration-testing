import { gql } from '@apollo/client';

// ログインミューテーション
export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      isValid
      message
      data {
        accessToken
        refreshToken
        user {
          id
          email
          name
          createdAt
          updatedAt
        }
      }
    }
  }
`;

// サインアップミューテーション
export const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!, $name: String!) {
    signUp(signUpInput: { email: $email, password: $password, name: $name }) {
      isValid
      message
      data {
        accessToken
        refreshToken
        user {
          id
          email
          name
          createdAt
          updatedAt
        }
      }
    }
  }
`;

// トークンリフレッシュミューテーション
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!, $oldAccessToken: String) {
    refreshToken(refreshTokenInput: { refreshToken: $refreshToken, oldAccessToken: $oldAccessToken }) {
      isValid
      message
      data {
        accessToken
        refreshToken
        user {
          id
          email
          name
          createdAt
          updatedAt
        }
      }
    }
  }
`;
