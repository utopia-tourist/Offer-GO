import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "智能简历编辑器",
  description: "面向应届生和职场新人的 AI 简历优化工具"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
