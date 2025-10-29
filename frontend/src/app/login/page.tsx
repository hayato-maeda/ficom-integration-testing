'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import { FicomTextField } from '@/components/common';
import { FicomButton } from '@/components/common';
import { useLogin } from '@/hooks/useLogin';
import { useAuth } from '@/lib/auth-context';

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const loginMutation = useLogin();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // ログイン済みの場合はリダイレクト
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const onSubmit = (data: LoginFormInputs) => {
    loginMutation.mutate(
      { loginInput: data },
      {
        onSuccess: () => {
          router.push('/');
        },
      }
    );
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          ログイン
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          FICOM Integration Testing
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, width: '100%' }}>
          {loginMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginMutation.error?.message || 'ログインに失敗しました'}
            </Alert>
          )}

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FicomTextField
                {...field}
                label="メールアドレス"
                type="email"
                autoComplete="email"
                autoFocus
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <FicomTextField
                {...field}
                label="パスワード"
                type="password"
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ mb: 3 }}
              />
            )}
          />

          <FicomButton
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            loading={loginMutation.isPending}
          >
            ログイン
          </FicomButton>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={NextLink} href="/signup" variant="body2">
              アカウントをお持ちでない方はこちら
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
