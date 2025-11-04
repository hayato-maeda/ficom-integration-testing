import { gql } from '@apollo/client';

/**
 * ログインミューテーション
 *
 * メールアドレスとパスワードでログインします。
 * トークンはセッションCookieで自動管理されます。
 *
 * @param {string} email - メールアドレス
 * @param {string} password - パスワード
 * @returns {MutationResponse<AuthResponse>} 認証レスポンス（ユーザー情報と有効期限）
 */
export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      isValid
      message
      data {
        user {
          id
          email
          name
          role
          createdAt
          updatedAt
        }
        accessTokenExpiresAt
      }
    }
  }
`;

/**
 * サインアップ（新規登録）ミューテーション
 *
 * 新しいユーザーを登録します。
 * トークンはセッションCookieで自動管理されます。
 *
 * @param {string} email - メールアドレス
 * @param {string} password - パスワード
 * @param {string} name - ユーザー名
 * @returns {MutationResponse<AuthResponse>} 認証レスポンス（ユーザー情報と有効期限）
 */
export const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!, $name: String!) {
    signUp(signUpInput: { email: $email, password: $password, name: $name }) {
      isValid
      message
      data {
        user {
          id
          email
          name
          role
          createdAt
          updatedAt
        }
        accessTokenExpiresAt
      }
    }
  }
`;

/**
 * ログアウトミューテーション
 *
 * セッションCookieを破棄してユーザーをログアウトします。
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

/**
 * リフレッシュトークンミューテーション
 *
 * セッションCookieからリフレッシュトークンを取得して、
 * 新しいアクセストークンを発行します。
 *
 * @returns {MutationResponse<AuthResponse>} 認証レスポンス（ユーザー情報と有効期限）
 */
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      isValid
      message
      data {
        user {
          id
          email
          name
          role
          createdAt
          updatedAt
        }
        accessTokenExpiresAt
      }
    }
  }
`;
