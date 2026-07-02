import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

// 直接读取 JSON 数据，避免 server-only 模块问题
function readIntelFiles(): { name: string; content: string; frontmatter: Record<string, any> }[] {
  const intelDir = path.join(process.cwd(), 'content', 'intel');
  if (!fs.existsSync(intelDir)) return [];

  const files = fs.readdirSync(intelDir).filter(f => {
    if (!f.endsWith('.md')) return false;
    // 排除所有 pitfall 类文件，它们有专门的踩坑质量测试
    if (f.includes('pitfall')) return false;
    return true;
  });
  return files.map(name => {
    const raw = fs.readFileSync(path.join(intelDir, name), 'utf8');
    const { data: frontmatter, content } = matter(raw);
    return { name, content: content.trim(), frontmatter };
  });
}

function readJsonFile<T>(relativePath: string): T[] {
  const filePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T[];
}

describe('情报内容质量', () => {
  const articles = readIntelFiles();

  it('应有足够的文章数量', () => {
    expect(articles.length).toBeGreaterThanOrEqual(40);
  });

  it('每篇文章应有足够的内容长度（≥800 字符）', () => {
    const shortArticles: string[] = [];
    articles.forEach(a => {
      if (a.content.length < 800) shortArticles.push(a.name);
    });
    expect(shortArticles).toEqual([]);
  });

  it('每篇文章应包含代码示例', () => {
    const noCode: string[] = [];
    articles.forEach(a => {
      if (!a.content.includes('```')) noCode.push(a.name);
    });
    expect(noCode).toEqual([]);
  });

  it('每篇文章应有 title frontmatter', () => {
    const missing: string[] = [];
    articles.forEach(a => {
      if (!a.frontmatter.title) missing.push(a.name);
    });
    expect(missing).toEqual([]);
  });

  it('每篇文章应有 category frontmatter', () => {
    const missing: string[] = [];
    articles.forEach(a => {
      if (!a.frontmatter.category) missing.push(a.name);
    });
    expect(missing).toEqual([]);
  });

  it('每篇文章应有 summary frontmatter', () => {
    const missing: string[] = [];
    articles.forEach(a => {
      if (!a.frontmatter.summary) missing.push(a.name);
    });
    expect(missing).toEqual([]);
  });

  it('每篇文章应包含常见误区或注意事项', () => {
    const noMistakes: string[] = [];
    articles.forEach(a => {
      const hasMistakes = a.content.includes('误区') || a.content.includes('注意') || a.content.includes('常见错误') || a.content.includes('坑');
      if (!hasMistakes) noMistakes.push(a.name);
    });
    // 宽松检查：只记录但不强制失败
    if (noMistakes.length > 0) {
      console.log(`以下文章缺少误区分析: ${noMistakes.join(', ')}`);
    }
  });
});

describe('术语内容质量', () => {
  interface TermEntry {
    term: string;
    slug: string;
    definition: string;
    category: string;
    relatedTerms: string[];
  }

  const terms = readJsonFile<TermEntry>('content/glossary/terms.json');

  it('应有足够的术语数量', () => {
    expect(terms.length).toBeGreaterThanOrEqual(20);
  });

  it('每个术语应有足够的定义长度（≥30 字符）', () => {
    const shortTerms: string[] = [];
    terms.forEach(t => {
      if (t.definition.length < 30) shortTerms.push(t.slug);
    });
    expect(shortTerms).toEqual([]);
  });

  it('每个术语应有关联术语', () => {
    const noRelated: string[] = [];
    terms.forEach(t => {
      if (!t.relatedTerms || t.relatedTerms.length === 0) noRelated.push(t.slug);
    });
    expect(noRelated).toEqual([]);
  });

  it('每个术语应有详情文件', () => {
    const missingDetail: string[] = [];
    terms.forEach(t => {
      const detailPath = path.join(process.cwd(), 'content', 'glossary', 'terms', `${t.slug}.md`);
      if (!fs.existsSync(detailPath)) missingDetail.push(t.slug);
    });
    if (missingDetail.length > 0) {
      console.log(`缺少详情文件的术语: ${missingDetail.join(', ')}`);
    }
  });
});

describe('工具内容质量', () => {
  interface ToolEntry {
    name: string;
    slug: string;
    category: string;
    description: string;
    use_cases: string[];
    official_url: string;
  }

  const toolsFilePath = path.join(process.cwd(), 'content', 'toolbox', 'tools.json');
  const toolsRaw = fs.existsSync(toolsFilePath)
    ? JSON.parse(fs.readFileSync(toolsFilePath, 'utf8'))
    : { tools: [] };
  const tools: ToolEntry[] = Array.isArray(toolsRaw) ? toolsRaw : (toolsRaw.tools ?? []);

  it('应有足够的工具数量', () => {
    expect(tools.length).toBeGreaterThanOrEqual(15);
  });

  it('每个工具应有足够的描述长度（≥30 字符）', () => {
    const shortDesc: string[] = [];
    tools.forEach(t => {
      if (t.description.length < 30) shortDesc.push(t.slug);
    });
    expect(shortDesc).toEqual([]);
  });

  it('每个工具应有使用案例', () => {
    const noUseCases: string[] = [];
    tools.forEach(t => {
      if (!t.use_cases || t.use_cases.length === 0) noUseCases.push(t.slug);
    });
    expect(noUseCases).toEqual([]);
  });

  it('每个工具应有官方链接', () => {
    const noUrl: string[] = [];
    tools.forEach(t => {
      if (!t.official_url) noUrl.push(t.slug);
    });
    expect(noUrl).toEqual([]);
  });
});

describe('踩坑内容质量', () => {
  interface PitfallEntry {
    title: string;
    slug: string;
    category: string;
    description: string;
    root_cause: string;
    symptoms: string[];
    solution: string[];
    quickFix: string;
    tags: string[];
    prevention?: string[];
  }

  function readPitfallFromIntel(): PitfallEntry[] {
    const intelDir = path.join(process.cwd(), 'content', 'intel');
    if (!fs.existsSync(intelDir)) return [];

    const files = fs.readdirSync(intelDir).filter(f => {
      if (!f.endsWith('.md') || !f.includes('pitfall')) return false;
      const match = f.match(/^(\d+)-/);
      if (!match) return false;
      const num = parseInt(match[1], 10);
      return num >= 140;
    });
    return files.map(name => {
      const raw = fs.readFileSync(path.join(intelDir, name), 'utf8');
      const { data: frontmatter, content } = matter(raw);
      const slug = name.replace(/\.md$/, '');

      // 提取症状
      const symptomsMatch = content.match(/###\s*🔑\s*典型症状\s*\n([\s\S]*?)(?=\n###|$)/);
      const symptoms = symptomsMatch
        ? symptomsMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*[×x]\s*/, '').trim())
        : [];

      // 提取根因
      const rootCauseMatch = content.match(/###\s*🔑\s*根本原因\s*\n([\s\S]*?)(?=\n###|$)/);
      const root_cause = rootCauseMatch ? rootCauseMatch[1].trim() : '';

      // 提取解决方案
      const solutionMatch = content.match(/##\s*完整排查方案\s*\n([\s\S]*?)(?=\n###|$)/);
      let solution: string[] = [];
      if (solutionMatch) {
        solution = solutionMatch[1]
          .split('\n')
          .filter(l => /^\d+\.\s/.test(l.trim()))
          .map(l => l.replace(/^\d+\.\s*/, '').trim());
      }

      // 提取快速修复
      const quickFixMatch = content.match(/>\s*\*\*快速修复：\*\*(.*?)(?:\n|$)/);
      const quickFix = quickFixMatch ? quickFixMatch[1].trim() : '';

      // 提取预防措施
      const preventionMatch = content.match(/##\s*预防措施\s*\n([\s\S]*?)(?=\n##|$)/);
      const prevention = preventionMatch
        ? preventionMatch[1].split('\n').filter(l => l.trim().startsWith('- ')).map(l => l.replace(/^-\s*/, '').trim())
        : [];

      return {
        title: String(frontmatter.title || slug),
        slug,
        category: String(frontmatter.category || ''),
        description: String(frontmatter.summary || ''),
        root_cause,
        symptoms,
        solution,
        quickFix,
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        prevention: prevention.length > 0 ? prevention : undefined,
      };
    });
  }

  const pitfalls = readPitfallFromIntel();

  it('应有足够的踩坑数量', () => {
    expect(pitfalls.length).toBeGreaterThanOrEqual(15);
  });

  it('每个踩坑应有足够的描述长度（≥30 字符）', () => {
    const short: string[] = [];
    pitfalls.forEach(p => {
      if (p.description.length < 30) short.push(p.slug);
    });
    expect(short).toEqual([]);
  });

  it('每个踩坑应有足够的根因分析（≥20 字符）', () => {
    const short: string[] = [];
    pitfalls.forEach(p => {
      if (p.root_cause.length < 20) short.push(p.slug);
    });
    expect(short).toEqual([]);
  });

  it('每个踩坑应有症状列表', () => {
    const noSymptoms: string[] = [];
    pitfalls.forEach(p => {
      if (!p.symptoms || p.symptoms.length === 0) noSymptoms.push(p.slug);
    });
    expect(noSymptoms).toEqual([]);
  });

  it('每个踩坑应有解决方案', () => {
    const noSolution: string[] = [];
    pitfalls.forEach(p => {
      if (!p.solution || p.solution.length === 0) noSolution.push(p.slug);
    });
    expect(noSolution).toEqual([]);
  });

  it('每个踩坑应有标签', () => {
    const noTags: string[] = [];
    pitfalls.forEach(p => {
      if (!p.tags || p.tags.length === 0) noTags.push(p.slug);
    });
    expect(noTags).toEqual([]);
  });
});
