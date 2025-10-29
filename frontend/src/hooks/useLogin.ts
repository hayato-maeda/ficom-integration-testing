"use client";

import { useAuth } from "@/lib/auth-context";
import { useLoginMutation } from "@/types/generated/graphql";

interface LoginError {
  message: string;
}

export function useLogin() {
  const { setAuth } = useAuth();

  return useLoginMutation<LoginError>({
    onSuccess: (data) => {
      setAuth(data.login.user, data.login.accessToken, data.login.refreshToken);
    },
  });
}
