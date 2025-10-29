"use client";

import type { Metadata } from "next";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryProvider } from "@/lib/query-client";
import { EmotionCacheProvider } from "@/lib/emotion-cache";
import { AuthProvider } from "@/lib/auth-context";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: "FICOM Integration Testing",
  description: "結合テスト管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <EmotionCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </EmotionCacheProvider>
      </body>
    </html>
  );
}
