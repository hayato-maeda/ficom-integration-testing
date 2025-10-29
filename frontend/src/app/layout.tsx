import type { Metadata } from "next";
import { RootLayoutClient } from "./layout-client";

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
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
