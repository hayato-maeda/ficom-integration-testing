'use client';

import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export interface FicomButtonProps extends Omit<MuiButtonProps, 'loading'> {
  loading?: boolean;
}

/**
 * 再利用可能なButtonコンポーネント
 */
export function FicomButton({ loading, disabled, children, startIcon, ...props }: FicomButtonProps) {
  return (
    <MuiButton
      {...props}
      disabled={loading || disabled}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
    >
      {children}
    </MuiButton>
  );
}
