import type { MetadataRoute } from "next";
import { getAllIntelCards } from "@/lib/intel";
import { getAllTerms } from "@/lib/glossary";
import { getAllProjects } from "@/lib/practice";
import { getToolboxData, getToolId } from "@/lib/toolbox";
import { FULL_ROADMAP } from "@/lib/roadmap-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://techradar.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const cards = getAllIntelCards();
  const terms = getAllTerms();
  const projects = getAllProjects();
  const toolboxData = getToolboxData();
  const tools = toolboxData.tools || [];

  const intelPages = cards.map((card) => ({
    url: `${BASE_URL}/intel/${card.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const glossaryPages = terms.map((term) => ({
    url: `${BASE_URL}/glossary/${term.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const practicePages = projects.map((project) => ({
    url: `${BASE_URL}/practice/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const toolboxPages = tools.map((tool) => ({
    url: `${BASE_URL}/toolbox/${getToolId(tool)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const roadmapDailyPages: MetadataRoute.Sitemap = [];
  for (const node of FULL_ROADMAP) {
    if (node.dailyTasks && node.dailyTasks.length > 0) {
      for (const task of node.dailyTasks) {
        roadmapDailyPages.push({
          url: `${BASE_URL}/roadmap/${node.id}/day/${task.day}`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.5,
        });
      }
    }
  }

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/intel`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/roadmap`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/toolbox`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/pitfall`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/glossary`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/practice`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...intelPages,
    ...glossaryPages,
    ...practicePages,
    ...toolboxPages,
    ...roadmapDailyPages,
  ];
}
