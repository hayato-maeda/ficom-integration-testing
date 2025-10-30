'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/test-cases');
    }
  }, [shouldRedirect, router]);

  const validateName = (value: string) => {
    if (!value) {
      return '名前を入力してください';
    }
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value) {
      return 'メールアドレスを入力してください';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return '有効なメールアドレスを入力してください';
    }
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return 'パスワードを入力してください';
    }
    if (value.length < 8) {
      return 'パスワードは8文字以上で入力してください';
    }
    return '';
  };

  const validateConfirmPassword = (value: string, passwordValue: string) => {
    if (!value) {
      return 'パスワード（確認）を入力してください';
    }
    if (value !== passwordValue) {
      return 'パスワードが一致しません';
    }
    return '';
  };

  const handleSignup = async () => {
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validateConfirmPassword(confirmPassword, password);

    setNameError(nameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);

    if (nameErr || emailErr || passwordErr || confirmPasswordErr) {
      return;
    }

    setIsLoading(true);
    setSignupError(null);

    const response = await signup({ name, email, password });

    if (response.isValid) {
      setShouldRedirect(true);
    } else {
      setSignupError(response.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">新規登録</CardTitle>
          <CardDescription>
            アカウント情報を入力して新規登録してください
          </CardDescription>
          {signupError && (
            <div className="mt-3 rounded-md bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-600">{signupError}</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input
              id="name"
              type="text"
              placeholder="山田太郎"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError('');
              }}
              disabled={isLoading}
            />
            {nameError && (
              <p className="text-sm text-red-500">{nameError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="text"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              disabled={isLoading}
            />
            {emailError && (
              <p className="text-sm text-red-500">{emailError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              disabled={isLoading}
            />
            {passwordError && (
              <p className="text-sm text-red-500">{passwordError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード（確認）</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError('');
              }}
              disabled={isLoading}
            />
            {confirmPasswordError && (
              <p className="text-sm text-red-500">{confirmPasswordError}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 mt-2">
          <Button onClick={handleSignup} className="w-full" disabled={isLoading}>
            {isLoading ? '登録中...' : '新規登録'}
          </Button>
          <p className="text-sm text-center text-gray-600">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              ログイン
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
