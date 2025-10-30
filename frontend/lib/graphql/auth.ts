import { gql } from '@apollo/client';

/**
 * ログインミューテーション
 *
 * メールアドレスとパスワードでログインし、アクセストークンとリフレッシュトークンを取得します。
 *
 * @param {string} email - メールアドレス
 * @param {string} password - パスワード
 * @returns {MutationResponse<AuthResponse>} 認証レスポンス（トークンとユーザー情報）
 */
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

/**
 * サインアップ（新規登録）ミューテーション
 *
 * 新しいユーザーを登録し、アクセストークンとリフレッシュトークンを取得します。
 *
 * @param {string} email - メールアドレス
 * @param {string} password - パスワード
 * @param {string} name - ユーザー名
 * @returns {MutationResponse<AuthResponse>} 認証レスポンス（トークンとユーザー情報）
 */
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

/**
 * トークンリフレッシュミューテーション
 *
 * リフレッシュトークンを使用して、新しいアクセストークンとリフレッシュトークンを取得します。
 *
 * @param {string} refreshToken - リフレッシュトークン
 * @param {string} [oldAccessToken] - 古いアクセストークン（オプション）
 * @returns {MutationResponse<AuthResponse>} 認証レスポンス（新しいトークンとユーザー情報）
 */
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
