import termsData from "./terms.json";

export interface Term {
  term: string;
  explanation: string;
  link?: string | null;
  relatedNodes?: string[];
}

/**
 * 获取所有术语
 */
export function getAllTerms(): Term[] {
  return termsData.terms;
}

/**
 * 根据节点 ID 获取相关术语
 */
export function getTermsByNode(nodeId: string): Term[] {
  return termsData.terms.filter(
    (t) => t.relatedNodes && t.relatedNodes.includes(nodeId)
  );
}

/**
 * 根据术语名称查找术语
 */
export function getTermByName(name: string): Term | undefined {
  return termsData.terms.find(
    (t) => t.term.toLowerCase() === name.toLowerCase()
  );
}

/**
 * 在文本中识别并标记术语
 * 返回一个数组，包含普通文本和术语对象
 */
export function identifyTermsInText(text: string, nodeId?: string): Array<{ type: "text" | "term"; content: string; term?: Term }> {
  const result: Array<{ type: "text" | "term"; content: string; term?: Term }> = [];
  const terms = nodeId ? getTermsByNode(nodeId) : getAllTerms();

  // 按术语长度降序排序，避免短术语先匹配
  const sortedTerms = [...terms].sort((a, b) => b.term.length - a.term.length);

  let remaining = text;
  let lastIndex = 0;

  // 使用正则表达式匹配术语
  for (const term of sortedTerms) {
    const regex = new RegExp(`\\b${term.term}\\b`, "gi");
    let match;

    while ((match = regex.exec(remaining)) !== null) {
      const matchIndex = match.index;

      // 添加术语前的普通文本
      if (matchIndex > lastIndex) {
        result.push({
          type: "text",
          content: remaining.slice(lastIndex, matchIndex),
        });
      }

      // 添加术语
      result.push({
        type: "term",
        content: match[0],
        term: term,
      });

      lastIndex = matchIndex + match[0].length;
    }
  }

  // 添加剩余的普通文本
  if (lastIndex < remaining.length) {
    result.push({
      type: "text",
      content: remaining.slice(lastIndex),
    });
  }

  return result;
}

/**
 * 常见需要国内镜像的资源域名
 */
export const MIRROR_DOMAINS: Record<string, string> = {
  "github.com": "GitHub 镜像：gitclone.com 或 hub.fastgit.xyz",
  "raw.githubusercontent.com": "GitHub 文件镜像：raw.gitmirror.com",
  "pytorch.org": "PyTorch 国内镜像：pytorch.org/zh 或清华源",
  "huggingface.co": "HuggingFace 镜像：hf-mirror.com",
  "arxiv.org": "论文镜像：arxiv.xixiaoyao.com",
  "stackoverflow.com": "StackOverflow 国内可访问",
  "youtube.com": "YouTube 镜像：bilibili.com 有大量教程",
  "colab.research.google.com": "Colab 镜像：使用 Kaggle Notebooks 或本地 Jupyter",
};

/**
 * 检测链接是否需要国内镜像提示
 */
export function getMirrorHint(url: string): { needsMirror: boolean; hint?: string } {
  for (const [domain, hint] of Object.entries(MIRROR_DOMAINS)) {
    if (url.includes(domain)) {
      return { needsMirror: true, hint };
    }
  }
  return { needsMirror: false };
}
