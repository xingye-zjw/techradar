import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechRadar 极客雷达",
  description: "AI 驱动的大学生硬核开源实战导航系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        {/* 使用国内 CDN 镜像加载 Google Fonts */}
        <link
          href="https://fonts.loli.net/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
