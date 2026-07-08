/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  swcMinify: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["@xyflow/react", "fuse.js", "gray-matter"],
  },
  // 注：HTTP 安全头 & 静态资源缓存头在静态导出下不通过 Next 配置生效
  //     统一在 public/_headers 与 public/_redirects 中声明（Cloudflare Pages 部署时自动加载）
  //     可覆盖 Cache-Control / CSP / X-Frame-Options 等全部标准响应头
};

module.exports = nextConfig;
