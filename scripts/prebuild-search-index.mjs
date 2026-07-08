import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getUnifiedSearchIndex } from "../lib/search.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public");
mkdirSync(outDir, { recursive: true });
const idx = getUnifiedSearchIndex();
writeFileSync(join(outDir, "search-index.json"), JSON.stringify(idx));
console.log(`✅ 预生成搜索索引: ${idx.length} 条 -> public/search-index.json`);
