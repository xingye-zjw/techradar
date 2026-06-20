import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://techradar.example.com/sitemap.xml", // TODO: 替换为实际域名
  };
}
