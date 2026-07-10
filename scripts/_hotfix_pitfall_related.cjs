// 修复 9 个 Pitfall (174-182) 的 frontmatter: 若 relatedTerms/Tools/Nodes 为空/null 则按 category 重填
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = process.cwd();
const PIT = path.join(ROOT, 'content', 'pitfall');
const SLUGS = [
  ['174-pitfall-data-poisoning', 'llm'],
  ['175-pitfall-prompt-injection-defense', 'llm'],
  ['176-pitfall-tensorRT-fp16-overflow', 'deep-learning'],
  ['177-pitfall-hallucination-grounding', 'llm'],
  ['178-pitfall-data-leakage', 'machine-learning'],
  ['179-pitfall-class-imbalance', 'machine-learning'],
  ['180-pitfall-i2c-lockup', 'embedded'],
  ['181-pitfall-battery-life', 'embedded'],
  ['182-pitfall-gpio-noise', 'embedded'],
];

const DEFAULTS = {
  'llm': {
    terms: ['transformer', 'lora', 'rag', 'chain-of-thought', 'function-calling'],
    tools: ['huggingface-transformers', 'langchain', 'pytorch', 'ollama', 'vllm'],
    nodes: ['llm-inference', 'llm-prompt-engineering', 'llm-finetune', 'llm-rag'],
  },
  'deep-learning': {
    terms: ['transformer', 'cnn', 'gradient-descent', 'tensor', 'matrix'],
    tools: ['pytorch', 'huggingface-transformers', 'numpy'],
    nodes: ['llm-inference', 'cv-segmentation'],
  },
  'machine-learning': {
    terms: ['gradient-descent', 'matrix', 'convex-optimization', 'tensor'],
    tools: ['scikit-learn', 'numpy', 'pandas', 'matplotlib'],
    nodes: ['math-linear-algebra', 'llm-inference'],
  },
  'embedded': {
    terms: ['rtos', 'algorithm', 'data-structure', 'complexity'],
    tools: ['vscode', 'gcc', 'freertos', 'stm32cubemx'],
    nodes: ['electrical-safety', 'roadmap-capstone'],
  },
};

const DEF = (cat) => DEFAULTS[cat] || DEFAULTS.llm;

let fixed = 0;
for (const [slug, cat] of SLUGS) {
  const file = path.join(PIT, `${slug}.md`);
  if (!fs.existsSync(file)) { console.log('[MISSING]', slug); continue; }
  const raw = fs.readFileSync(file, 'utf8');
  const m = matter(raw);
  let changed = false;
  for (const [k, key_default] of Object.entries({ relatedTerms: 'terms', relatedTools: 'tools', relatedNodes: 'nodes' })) {
    const existing = m.data[k];
    const bad = !Array.isArray(existing) || existing.filter(x => typeof x === 'string' && x.trim()).length < 2;
    if (bad) {
      m.data[k] = DEF(cat)[key_default];
      changed = true;
    }
  }
  if (!changed) { console.log('[KEEP]', slug, 'terms', m.data.relatedTerms.length); continue; }
  const out = matter.stringify(m.content, m.data, { lineWidth: -1 });
  fs.writeFileSync(file, out, 'utf8');
  fixed += 1;
  console.log('[FIX]', slug, 'terms=', m.data.relatedTerms.length, 'tools=', m.data.relatedTools.length, 'nodes=', m.data.relatedNodes.length);
}
console.log(`Fixed ${fixed}/${SLUGS.length} pitfall related* fields.`);
