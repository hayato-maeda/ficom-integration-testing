'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export interface FicomLoadingProps {
  message?: string;
  size?: number;
}

/**
 * 再利用可能なLoadingコンポーネント
 */
export function FicomLoading({ message = '読み込み中...', size = 40 }: FicomLoadingProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      {message && <Typography variant="body2" color="text.secondary">{message}</Typography>}
    </Box>
  );
}
