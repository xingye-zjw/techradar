// Backfill non-empty `tags` array into every pitfall MD file (90-162 in content/intel, 174-182 in content/pitfall).
// Logic: if tags is missing, empty string, empty array, or STRING (not array) → replace with category-based defaults.
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = process.cwd();
const DIRS = [path.join(ROOT, 'content', 'intel'), path.join(ROOT, 'content', 'pitfall')];

// Category -> default tags list (3-5 each, matches existing conventions in project)
const DEFAULT_TAGS = {
  'llm': ['大模型', 'LLM', 'Prompt', '推理'],
  'deep-learning': ['深度学习', 'DL', '训练', 'PyTorch'],
  'machine-learning': ['机器学习', 'ML', '数据', 'scikit-learn'],
  'computer-vision': ['CV', '视觉', '检测', '模型'],
  'nlp': ['NLP', '文本', '语义', 'Transformers'],
  'embedded': ['嵌入式', 'MCU', '硬件', '驱动'],
  'devops': ['DevOps', '部署', '运维', '容器'],
  'best-practices': ['最佳实践', '规范', '协作', '质量'],
  'electronics': ['电子', '电路', '硬件', 'PCB'],
  'signals': ['信号', 'DSP', '无线', '通信'],
  'control': ['控制', 'PID', '系统', 'PLC'],
  'data-processing': ['数据', '处理', '清洗', 'ETL'],
  'security': ['安全', '漏洞', '防护', 'LLM安全'],
};
const FALLBACK = ['踩坑', '避坑指南', '经验', '常见问题'];

let fixed = 0, kept = 0;
for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const fn of fs.readdirSync(dir)) {
    if (!/pitfall.*\.md$/i.test(fn)) continue;
    const fp = path.join(dir, fn);
    const raw = fs.readFileSync(fp, 'utf8');
    const m = matter(raw);
    const tags = m.data.tags;
    let good = Array.isArray(tags) && tags.filter(x => typeof x === 'string' && x.trim()).length > 0;
    if (good) { kept++; continue; }
    // Missing / string(even if looks like list) / empty → backfill
    const cat = String(m.data.category || 'best-practices').trim();
    m.data.tags = (DEFAULT_TAGS[cat] || FALLBACK).slice();
    const out = matter.stringify(m.content, m.data, { lineWidth: -1 });
    fs.writeFileSync(fp, out, 'utf8');
    fixed++;
    console.log(`[FIX] ${fn}  cat=${cat}  tags=${m.data.tags.length}`);
  }
}
console.log(`\nPitfall tags: ${fixed} backfilled / ${kept} kept-OK`);
