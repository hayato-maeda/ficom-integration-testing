'use client';

import MuiTextField, { type TextFieldProps as MuiTextFieldProps } from "@mui/material/TextField";

export type FicomTextFieldProps = MuiTextFieldProps;

/**
 * 再利用可能なTextFieldコンポーネント
 * React Hook Formとの統合を考慮
 */
export function FicomTextField(props: FicomTextFieldProps) {
  return <MuiTextField fullWidth {...props} />;
}
