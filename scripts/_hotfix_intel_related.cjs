// 修复 7 篇 Intel (183-189) 的 relatedTerms/Tools/Nodes 数组：若为 null/空则按 category 白名单重填
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const ROOT = process.cwd();
const INTEL = path.join(ROOT, 'content', 'intel');
const CFG = [
  ['183-gitops-argo-cd', 'devops'],
  ['184-agent-tracing-eval', 'devops'],
  ['185-probability-distributions', 'math'],
  ['186-linear-algebra-ml', 'math'],
  ['187-llm-eval-ragas', 'nlp'],
  ['188-reranker-multilingual', 'nlp'],
  ['189-speech-asr-tts', 'speech'],
];

const DEFAULTS = {
  devops: {
    relatedTerms: ['docker', 'linux', 'git', 'kubernetes', 'prometheus'],
    relatedTools: ['docker', 'mlflow', 'kubernetes', 'prometheus', 'grafana'],
    relatedNodes: ['devops-kubernetes', 'docker-basic', 'llm-inference'],
  },
  math: {
    relatedTerms: ['convex-optimization', 'matrix', 'entropy', 'tensor'],
    relatedTools: ['numpy', 'pandas', 'jupyter', 'matplotlib'],
    relatedNodes: ['math-linear-algebra', 'llm-inference'],
  },
  nlp: {
    relatedTerms: ['transformer', 'rag', 'reranker', 'chain-of-thought', 'speech-asr'],
    relatedTools: ['huggingface-transformers', 'langchain', 'numpy', 'ollama'],
    relatedNodes: ['nlp-rnn', 'llm-inference', 'llm-finetune'],
  },
  speech: {
    relatedTerms: ['transformer', 'speech-asr', 'speech-tts', 'function-calling'],
    relatedTools: ['pytorch', 'numpy', 'streamlit', 'huggingface-transformers'],
    relatedNodes: ['nlp-rnn', 'llm-inference', 'llm-prompt-engineering'],
  },
};

let fixed = 0;
for (const [slug, cat] of CFG) {
  const fp = path.join(INTEL, `${slug}.md`);
  if (!fs.existsSync(fp)) { console.log('[MISSING]', fp); continue; }
  const raw = fs.readFileSync(fp, 'utf8');
  const m = matter(raw);
  let changed = false;
  for (const k of ['relatedTerms', 'relatedTools', 'relatedNodes']) {
    const existing = m.data[k];
    const bad = !Array.isArray(existing) || existing.filter(x => typeof x === 'string' && x.trim()).length < 2;
    if (bad) {
      m.data[k] = DEFAULTS[cat][k];
      changed = true;
    }
  }
  if (!changed) { console.log('[KEEP]', slug, 'terms', (m.data.relatedTerms || []).length); continue; }
  const out = matter.stringify(m.content, m.data, { lineWidth: -1 });
  fs.writeFileSync(fp, out, 'utf8');
  fixed += 1;
  console.log('[FIX]', slug, 'terms=', (m.data.relatedTerms || []).length, 'tools=', (m.data.relatedTools || []).length, 'nodes=', (m.data.relatedNodes || []).length);
}
console.log(`Fixed ${fixed}/${CFG.length} intel related* fields.`);
