'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

const signupSchema = z
  .object({
    name: z.string().min(1, '名前を入力してください'),
    email: z.email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
    confirmPassword: z.string().min(1, 'パスワード（確認）を入力してください'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);

    const { confirmPassword: _confirmPassword, ...signupData } = data;
    const response = await signup(signupData);

    if (response.isValid) {
      toast.dismiss('signup-error');
      toast.success('アカウントが登録されました', {
        id: 'registration-success',
        style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
      });
      router.push('/test-cases');
    } else {
      toast.error(response.message, {
        id: 'signup-error',
        style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">新規登録</CardTitle>
          <CardDescription>アカウント情報を入力して新規登録してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input id="name" type="text" placeholder="山田太郎" {...register('name')} disabled={isLoading} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="text"
              placeholder="example@example.com"
              disabled={isLoading}
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" type="password" disabled={isLoading} {...register('password')} />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード（確認）</Label>
            <Input id="confirmPassword" type="password" disabled={isLoading} {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 mt-2">
          <Button onClick={handleSubmit(onSubmit)} className="w-full" disabled={isLoading}>
            {isLoading ? '登録中...' : '新規登録'}
          </Button>
          <p className="text-sm text-center text-gray-600">
            {'すでにアカウントをお持ちの方は '}
            <Link href="/login" className="text-blue-600 hover:underline">
              ログイン
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
