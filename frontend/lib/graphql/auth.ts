import { gql } from '@apollo/client';

/**
 * ログインミューテーション
 *
 * メールアドレスとパスワードでログインします。
 * トークンはhttpOnly Cookieで管理されるため、レスポンスには含まれません。
 *
 * @param {string} email - メールアドレス
 * @param {string} password - パスワード
 * @returns {MutationResponse<AuthResponse>} 認証レスポンス（ユーザー情報）
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
 * 新しいユーザーを登録します。
 * トークンはhttpOnly Cookieで管理されるため、レスポンスには含まれません。
 *
 * @param {string} email - メールアドレス
 * @param {string} password - パスワード
 * @param {string} name - ユーザー名
 * @returns {MutationResponse<AuthResponse>} 認証レスポンス（ユーザー情報）
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
 * セッションCookieからリフレッシュトークンを使用して、新しいアクセストークンを取得します。
 * トークンはhttpOnly Cookieで管理されるため、引数やレスポンスには含まれません。
 *
 * @returns {MutationResponse<AuthResponse>} 認証レスポンス（ユーザー情報）
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
 * セッションを破棄してログアウトします。
 * httpOnly Cookieのトークンがクリアされます。
 *
 * @returns {MutationResponse} ログアウト結果
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
 * 現在のユーザー情報取得クエリ
 *
 * JWTアクセストークンから現在ログイン中のユーザー情報を取得します。
 * リロード時の認証状態確認やトークン検証に使用します。
 *
 * @returns {User} 現在のユーザー情報
 */
export const ME_QUERY = gql`
  query Me {
    me {
      createdAt
      email
      id
      name
      role
      updatedAt
    }
  }
`;
