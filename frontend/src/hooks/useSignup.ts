"use client";

import { useAuth } from "@/lib/auth-context";
import { useSignUpMutation } from "@/types/generated/graphql";

interface SignupError {
  message: string;
}

export function useSignup() {
  const { setAuth } = useAuth();

  return useSignUpMutation<SignupError>({
    onSuccess: (data) => {
      setAuth(data.signUp.user, data.signUp.accessToken, data.signUp.refreshToken);
    },
  });
}
