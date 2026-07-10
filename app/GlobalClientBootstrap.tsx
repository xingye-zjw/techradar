"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Palette = dynamic(() => import("@/components/GlobalCommandPalette"), { ssr: false });

// 扩展 Window 类型，支持 PWA 安装提示延迟事件
declare global {
  interface Window {
    deferredPrompt?: any;
    showInstallPrompt?: () => Promise<boolean>;
  }
}

export default function GlobalClientBootstrap() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mount = async () => {
      try {
        const resp = await fetch("/search-index.json", { cache: "force-cache" });
        if (resp.ok) {
          const json = await resp.json();
          setItems(json);
          return;
        }
      } catch {
        /* 忽略 */
      }
    };
    const t = setTimeout(mount, 600);
    return () => clearTimeout(t);
  }, []);

  // =====================================================
  // PWA: 注册/更新 Service Worker
  // =====================================================
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        // 检测到 SW 更新时自动应用新版本
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // 新 SW 已就绪，可提示用户刷新（此处自动 skipWaiting 会立即激活）
              }
            });
          }
        });
      } catch {
        /* SW 注册失败静默忽略 */
      }
    };

    // 页面加载完成后再注册，避免阻塞首屏
    window.addEventListener("load", registerSW);

    return () => window.removeEventListener("load", registerSW);
  }, []);

  // =====================================================
  // PWA: 拦截 beforeinstallprompt，暴露手动安装函数
  // =====================================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // 将 Chrome 触发的安装提示事件保存，等待用户手动触发
      window.deferredPrompt = e;
    };

    // 暴露 showInstallPrompt 到 window，供 UI 按钮调用
    window.showInstallPrompt = async () => {
      const promptEvent = window.deferredPrompt;
      if (!promptEvent) return false;
      // 调用浏览器原生安装 UI
      promptEvent.prompt();
      const result = await promptEvent.userChoice;
      // 事件用完即弃，下次需要重新生成
      window.deferredPrompt = undefined;
      return result.outcome === "accepted";
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  return <Palette items={items} />;
}
