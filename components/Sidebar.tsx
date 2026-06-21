"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSidebarState, setSidebarState, toggleSidebar, type SidebarState } from "@/lib/storage";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  isNew?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "学习路线图", href: "/roadmap", icon: "🗺️" },
  { label: "技术情报", href: "/intel", icon: "📰" },
  { label: "工具推荐箱", href: "/toolbox", icon: "🧰" },
  { label: "踩坑避雷", href: "/pitfall", icon: "⚡" },
  { label: "专业术语", href: "/glossary", icon: "📖", isNew: true },
];

// 路线图页的目录结构
interface RoadmapSection {
  title: string;
  items: string[];
}

const ROADMAP_SECTIONS: RoadmapSection[] = [
  {
    title: "DevOps 方向",
    items: ["Linux 基础", "Git & GitHub", "Docker"],
  },
  {
    title: "Math 方向",
    items: ["线性代数", "概率与统计"],
  },
  {
    title: "CV 方向",
    items: ["PyTorch", "CNN", "目标检测"],
  },
];

// 情报页的标签
const INTEL_TAGS = ["#Transformer", "#YOLO", "#LoRA", "#RAG", "#CNN", "#Docker"];

// 术语页的分类
const GLOSSARY_CATEGORIES = ["AI/ML", "工程部署", "数学基础", "项目管理"];

// 工具箱分类
const TOOLBOX_CATEGORIES = ["IDE/编辑器", "深度学习框架", "数据处理", "部署工具"];

// 踩坑分类
const PITFALL_CATEGORIES = ["环境配置", "训练问题", "部署问题", "常见报错"];

type PageDirectory = RoadmapSection[] | string[];

function getPageDirectory(pathname: string): PageDirectory | null {
  if (pathname.startsWith("/roadmap")) return ROADMAP_SECTIONS;
  if (pathname.startsWith("/intel")) return INTEL_TAGS;
  if (pathname.startsWith("/glossary")) return GLOSSARY_CATEGORIES;
  if (pathname.startsWith("/toolbox")) return TOOLBOX_CATEGORIES;
  if (pathname.startsWith("/pitfall")) return PITFALL_CATEGORIES;
  return null;
}

function isRoadmapSectionArray(directory: PageDirectory): directory is RoadmapSection[] {
  return Array.isArray(directory) && directory.length > 0 && typeof directory[0] === "object";
}

export function Sidebar() {
  const pathname = usePathname();
  const [state, setState] = useState<SidebarState>("expanded");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setState(getSidebarState());
  }, []);

  // 当侧边栏状态改变时，更新 CSS 变量
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      state === "collapsed" ? "64px" : "240px"
    );
  }, [state]);

  const handleToggle = useCallback(() => {
    const next = toggleSidebar();
    setState(next);
  }, []);

  const handleCloseMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // Escape 键关闭移动端菜单
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        handleCloseMobile();
      }
    };

    if (isMobileOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen, handleCloseMobile]);

  const pageDirectory = getPageDirectory(pathname);
  const isCollapsed = state === "collapsed";

  const scrollToSection = (id: string) => {
    // 使用 requestAnimationFrame 确保 DOM 已渲染
    requestAnimationFrame(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    });
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleCloseMobile}
          role="button"
          aria-label="关闭菜单"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleCloseMobile();
            }
          }}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 bg-neutral-900 border-r border-neutral-800
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-16" : "w-60"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="主导航"
        aria-expanded={!isCollapsed}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-neutral-800">
            <Link href="/" className="flex items-center gap-2 overflow-hidden">
              <span className="text-lg">◢</span>
              {!isCollapsed && (
                <span className="font-bold text-neutral-100 whitespace-nowrap">
                  TechRadar
                </span>
              )}
            </Link>
            <button
              onClick={handleToggle}
              className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 transition-colors"
              title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
              aria-label={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
              aria-expanded={!isCollapsed}
            >
              <span className={`transition-transform ${isCollapsed ? "rotate-180" : ""}`}>
                ◀
              </span>
            </button>
          </div>

          {/* 全局导航 */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${isActive
                        ? "bg-green-500/10 text-green-400 border-l-[3px] border-green-400"
                        : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border-l-[3px] border-transparent"
                      }
                    `}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="text-base flex-shrink-0" aria-hidden="true">{item.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.isNew && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                            NEW
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* 页面目录 */}
            {!isCollapsed && pageDirectory && (
              <div className="mt-6 px-4">
                <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider mb-3">
                  当前页面
                </div>
                <div className="space-y-3">
                  {isRoadmapSectionArray(pageDirectory) ? (
                    // 分组形式（如路线图）
                    pageDirectory.map((section, idx) => (
                      <div key={idx}>
                        <div className="font-mono text-[10px] text-neutral-600 mb-1">
                          {section.title}
                        </div>
                        <div className="space-y-1">
                          {section.items.map((item) => (
                            <button
                              key={item}
                              className="block w-full text-left text-xs text-neutral-400 hover:text-cyan-400 py-0.5"
                              onClick={() => scrollToSection(item.toLowerCase().replace(/\s+/g, "-"))}
                            >
                              · {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    // 标签形式（如情报）
                    <div className="flex flex-wrap gap-1">
                      {(pageDirectory as string[]).map((tag) => (
                        <button
                          key={tag}
                          className="text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </nav>

          {/* 收起态的图标模式 */}
          {isCollapsed && (
            <div className="py-4 px-2 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-lg transition-all
                    ${pathname.startsWith(item.href)
                      ? "bg-green-500/10 text-green-400"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                    }
                  `}
                  title={item.label}
                  aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                >
                  <span className="text-base" aria-hidden="true">{item.icon}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* 移动端汉堡菜单按钮 */}
      <button
        className="fixed top-4 left-4 z-30 lg:hidden w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400"
        onClick={() => setIsMobileOpen(true)}
        aria-label="打开菜单"
        aria-expanded={isMobileOpen}
      >
        <span aria-hidden="true">☰</span>
      </button>
    </>
  );
}

export { NAV_ITEMS };
