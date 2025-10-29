'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { FicomButton } from '@/components/common';
import { useAuth } from '@/lib/auth-context';
import { useLogout } from '@/hooks/useLogout';

export default function HomePage() {
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <AuthGuard>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            FICOM Integration Testing
          </Typography>
          <Typography variant="body1" gutterBottom>
            ようこそ、{user?.name}さん
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            メールアドレス: {user?.email}
          </Typography>
          <Box sx={{ mt: 3 }}>
            <FicomButton variant="outlined" onClick={logout}>
              ログアウト
            </FicomButton>
          </Box>
        </Box>
      </Container>
    </AuthGuard>
  );
}
