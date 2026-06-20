import fs from "node:fs";
import path from "node:path";

export interface Pitfall {
  title: string;
  category: string;
  symptoms: string[];
  solution: string[];
  quickFix?: string;
  tags: string[];
}

let cachedPitfalls: Pitfall[] | null = null;

export function getAllPitfalls(): Pitfall[] {
  if (cachedPitfalls) return cachedPitfalls;

  const dataPath = path.join(process.cwd(), "content", "pitfall", "pitfalls.json");

  if (!fs.existsSync(dataPath)) {
    cachedPitfalls = [];
    return cachedPitfalls;
  }

  const raw = fs.readFileSync(dataPath, "utf8");
  cachedPitfalls = JSON.parse(raw) as Pitfall[];
  return cachedPitfalls;
}
