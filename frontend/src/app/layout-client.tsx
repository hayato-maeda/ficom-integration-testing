"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryProvider } from "@/lib/query-client";
import { EmotionCacheProvider } from "@/lib/emotion-cache";
import { AuthProvider } from "@/lib/auth-context";
import { theme } from "@/lib/theme";

export function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <EmotionCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </EmotionCacheProvider>
  );
}
