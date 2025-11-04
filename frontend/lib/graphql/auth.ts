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
          role
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
          role
          createdAt
          updatedAt
        }
      }
    }
  }
`;

/**
 * ログアウトミューテーション
 *
 * セッションを破棄してユーザーをログアウトします。
 *
 * @returns {MutationResponse<null>} ログアウト結果
 */
export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      isValid
      message
    }
  }
`;
