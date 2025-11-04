import { gql } from '@apollo/client';

/**
 * 現在のユーザー情報取得クエリ
 *
 * セッションから現在ログイン中のユーザー情報とトークン有効期限を取得します。
 *
 * @returns {MeResponse} ユーザー情報とトークン有効期限
 */
export const ME_QUERY = gql`
  query Me {
    me {
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
`;

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
 * サインアップ（新規登録）
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
 * ログアウト
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
 * リフレッシュトークン
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
