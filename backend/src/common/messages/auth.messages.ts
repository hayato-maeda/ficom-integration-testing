/**
 * 認証関連のメッセージ定数
 */
export const AUTH_MESSAGES = {
  // 成功メッセージ
  SIGNUP_SUCCESS: 'ユーザー登録が完了しました',
  LOGIN_SUCCESS: 'ログインに成功しました',
  TOKEN_REFRESH_SUCCESS: 'トークンの更新に成功しました',

  // エラーメッセージ
  EMAIL_ALREADY_EXISTS: 'このメールアドレスは既に登録されています',
  PASSWORD_TOO_SHORT: 'パスワードは8文字以上で入力してください',
  INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません',
  INVALID_REFRESH_TOKEN: '無効なリフレッシュトークンです',
  REFRESH_TOKEN_REVOKED: 'リフレッシュトークンは無効化されています',
  REFRESH_TOKEN_EXPIRED: 'リフレッシュトークンの有効期限が切れています',
  USER_NOT_FOUND_AFTER_UPDATE: 'ユーザー情報の取得に失敗しました',
} as const;
