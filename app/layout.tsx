import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/Toast";
import { Sidebar } from "@/components/Sidebar";
import GlobalClientBootstrap from "./GlobalClientBootstrap";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://techradar.ai"),
  title: "TechRadar 极客雷达",
  description: "AI 驱动的大学生硬核开源实战导航系统",
  manifest: "/manifest.webmanifest",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        {/*
          字体加载策略：
          - globals.css 顶部 @import(url('fonts.loli.net/css2?...&display=swap'))
            由 Next.js CSS pipeline 抽取、合并并输出到单独 CSS 资源（非阻塞样式）
          - 强制 font-display: swap，消除 FOIT，文字 100ms 内可见
          - @font-face 补充 local('Instrument Sans')，若用户系统已装字体则免请求
          - preconnect + dns-prefetch + preload as=style 三管齐下，加速字体 CSS 握手与下载
        */}
        <link rel="preconnect" href="https://fonts.loli.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.loli.net" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.loli.net/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="antialiased">
        <div className="animate-in fade-in duration-200">
          <Sidebar />
          <main className="min-h-screen transition-[margin] duration-300 lg:ml-[var(--sidebar-width)]">
            {children}
          </main>
        </div>
        <GlobalClientBootstrap />
        <ToastContainer />
      </body>
    </html>
  );
}
