'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          404 - ページが見つかりません
        </Typography>
        <Typography variant="body1" color="text.secondary">
          お探しのページは存在しないか、移動した可能性があります。
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/')}
        >
          トップページへ戻る
        </Button>
      </Box>
    </Container>
  );
}
