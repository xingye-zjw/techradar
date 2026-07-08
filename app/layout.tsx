import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/Toast";
import { Sidebar } from "@/components/Sidebar";
import GlobalClientBootstrap from "./GlobalClientBootstrap";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://techradar.ai"),
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
        {/*
          字体加载策略：
          - globals.css 顶部 @import(url('fonts.loli.net/css2?...&display=swap'))
            由 Next.js CSS pipeline 抽取、合并并输出到单独 CSS 资源（非阻塞样式）
          - 强制 font-display: swap，消除 FOIT，文字 100ms 内可见
          - @font-face 补充 local('Instrument Sans')，若用户系统已装字体则免请求
        */}
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
