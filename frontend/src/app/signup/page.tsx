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
import { useSignup } from '@/hooks/useSignup';
import { useAuth } from '@/lib/auth-context';

const signupSchema = z
  .object({
    name: z.string().min(1, 'ユーザー名を入力してください'),
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

type SignupFormInputs = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const signupMutation = useSignup();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
  });

  // ログイン済みの場合はリダイレクト
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const onSubmit = (data: SignupFormInputs) => {
    signupMutation.mutate(
      {
        signUpInput: {
          email: data.email,
          password: data.password,
          name: data.name,
        },
      },
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
          新規登録
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          FICOM Integration Testing
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, width: '100%' }}>
          {signupMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {signupMutation.error?.message || '登録に失敗しました'}
            </Alert>
          )}

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <FicomTextField
                {...field}
                label="ユーザー名"
                autoComplete="name"
                autoFocus
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FicomTextField
                {...field}
                label="メールアドレス"
                type="email"
                autoComplete="email"
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
                autoComplete="new-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <FicomTextField
                {...field}
                label="パスワード（確認）"
                type="password"
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                sx={{ mb: 3 }}
              />
            )}
          />

          <FicomButton
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            loading={signupMutation.isPending}
          >
            登録
          </FicomButton>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={NextLink} href="/login" variant="body2">
              既にアカウントをお持ちの方はこちら
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
