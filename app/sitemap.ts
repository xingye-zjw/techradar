import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { getAllIntelCards } from "@/lib/intel";
import { getAllTerms } from "@/lib/glossary";
import { getAllProjects } from "@/lib/practice";
import { getToolboxData, getToolId } from "@/lib/toolbox";
import { FULL_ROADMAP } from "@/lib/roadmap-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://techradar.ai";

function getFileMtime(absPath: string): Date {
  return fs.statSync(absPath).mtime;
}

function maxDate(dates: (Date | undefined)[]): Date {
  const valid = dates.filter((d): d is Date => d !== undefined && d instanceof Date);
  if (valid.length === 0) return new Date();
  return valid.reduce((a, b) => (a.getTime() > b.getTime() ? a : b));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const cards = getAllIntelCards();
  const terms = getAllTerms();
  const projects = getAllProjects();
  const toolboxData = getToolboxData();
  const tools = toolboxData.tools || [];

  const roadmapMtime = getFileMtime(path.join(process.cwd(), "lib", "roadmap-data.ts"));
  const termsJsonMtime = getFileMtime(
    path.join(process.cwd(), "content", "glossary", "terms.json"),
  );
  const toolsJsonMtime = getFileMtime(path.join(process.cwd(), "content", "toolbox", "tools.json"));
  const projectsJsonMtime = getFileMtime(
    path.join(process.cwd(), "content", "practice", "projects.json"),
  );

  const intelPages = cards.map((card) => {
    const mtime = getFileMtime(path.join(process.cwd(), "content", "intel", card.slug + ".md"));
    return {
      url: `${BASE_URL}/intel/${card.slug}`,
      lastModified: mtime,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

  const glossaryPages = terms.map((term) => {
    const mdPath = path.join(process.cwd(), "content", "glossary", "terms", term.slug + ".md");
    let mtime: Date;
    if (fs.existsSync(mdPath)) {
      mtime = getFileMtime(mdPath);
    } else {
      mtime = termsJsonMtime;
    }
    return {
      url: `${BASE_URL}/glossary/${term.slug}`,
      lastModified: mtime,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  const practicePages = projects.map((project) => ({
    url: `${BASE_URL}/practice/${project.slug}`,
    lastModified: projectsJsonMtime,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const toolboxPages = tools.map((tool) => ({
    url: `${BASE_URL}/toolbox/${getToolId(tool)}`,
    lastModified: toolsJsonMtime,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const roadmapDailyPages: MetadataRoute.Sitemap = [];
  for (const node of FULL_ROADMAP) {
    if (node.dailyTasks && node.dailyTasks.length > 0) {
      for (const task of node.dailyTasks) {
        roadmapDailyPages.push({
          url: `${BASE_URL}/roadmap/${node.id}/day/${task.day}`,
          lastModified: roadmapMtime,
          changeFrequency: "monthly" as const,
          priority: 0.5,
        });
      }
    }
  }

  const homeMtime = maxDate([
    ...(intelPages.map((p) => p.lastModified) as (Date | undefined)[]),
    ...(glossaryPages.map((p) => p.lastModified) as (Date | undefined)[]),
    ...(practicePages.map((p) => p.lastModified) as (Date | undefined)[]),
    ...(toolboxPages.map((p) => p.lastModified) as (Date | undefined)[]),
    ...(roadmapDailyPages.map((p) => p.lastModified) as (Date | undefined)[]),
  ]);

  const intelIndexMtime = maxDate(intelPages.map((p) => p.lastModified) as (Date | undefined)[]);
  const glossaryIndexMtime = maxDate(
    glossaryPages.map((p) => p.lastModified) as (Date | undefined)[],
  );
  const toolboxIndexMtime = maxDate(
    toolboxPages.map((p) => p.lastModified) as (Date | undefined)[],
  );
  const practiceIndexMtime = maxDate(
    practicePages.map((p) => p.lastModified) as (Date | undefined)[],
  );
  const roadmapIndexMtime = maxDate([
    roadmapMtime,
    ...(roadmapDailyPages.map((p) => p.lastModified) as (Date | undefined)[]),
  ]);
  const searchMtime = homeMtime;

  return [
    {
      url: BASE_URL,
      lastModified: homeMtime,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/intel`,
      lastModified: intelIndexMtime,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: searchMtime,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/roadmap`,
      lastModified: roadmapIndexMtime,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/toolbox`,
      lastModified: toolboxIndexMtime,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/pitfall`,
      lastModified: intelIndexMtime,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/glossary`,
      lastModified: glossaryIndexMtime,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/practice`,
      lastModified: practiceIndexMtime,
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
