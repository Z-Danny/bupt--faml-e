#!/usr/bin/env tsx
/**
 * 轻量化 AI 论文搜索工具
 * 使用 arXiv API 搜索论文，支持关键词过滤和格式化输出
 *
 * 使用方法:
 *   npx tsx paper-search.ts "AI mental health" 5
 *   npx tsx paper-search.ts "chatbot therapy" 10
 */

import { XMLParser } from "fast-xml-parser";

interface ArxivPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  published: string;
  categories: string[];
  pdf: string;
  url: string;
}

interface SearchOptions {
  query: string;
  maxResults: number;
  sortBy?: "relevance" | "lastUpdatedDate" | "submittedDate";
  sortOrder?: "ascending" | "descending";
}

/**
 * 搜索 arXiv 论文
 */
async function searchArxiv(options: SearchOptions): Promise<ArxivPaper[]> {
  const {
    query,
    maxResults = 10,
    sortBy = "relevance",
    sortOrder = "descending"
  } = options;

  // URL 编码查询
  const encodedQuery = encodeURIComponent(`all:${query}`);
  const url = `https://export.arxiv.org/api/query?search_query=${encodedQuery}&start=0&max_results=${maxResults}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`arXiv API error: ${response.status}`);
    }

    const xmlText = await response.text();

    // 解析 XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });

    const result = parser.parse(xmlText);
    const entries = result.feed?.entry || [];

    // 如果只有一条结果，entries 不是数组
    const papers = Array.isArray(entries) ? entries : [entries];

    return papers.map((entry: any) => ({
      id: entry.id.split("/").pop(),
      title: entry.title,
      abstract: entry.summary,
      authors: Array.isArray(entry.author)
        ? entry.author.map((a: any) => a.name)
        : [entry.author?.name],
      published: entry.published,
      categories: Array.isArray(entry.category)
        ? entry.category.map((c: any) => c["@_term"])
        : [entry.category?.["@_term"]],
      pdf: entry.link?.find((l: any) => l["@_title"] === "pdf")?.["@_href"] || "",
      url: entry.id
    }));
  } catch (error) {
    console.error("搜索失败:", error);
    return [];
  }
}

/**
 * 格式化输出论文信息
 */
function formatPaper(paper: ArxivPaper, index: number): string {
  const year = new Date(paper.published).getFullYear();
  const authors = paper.authors.slice(0, 3).join(", ") + (paper.authors.length > 3 ? " et al." : "");

  return `
[${index}] ${paper.title}
    作者: ${authors}
    年份: ${year}
    分类: ${paper.categories.join(", ")}
    PDF: ${paper.pdf}
`;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const query = args[0] || "AI mental health";
  const maxResults = parseInt(args[1]) || 5;

  console.log(`🔍 搜索 arXiv: "${query}" (最多 ${maxResults} 条)\n`);

  const papers = await searchArxiv({ query, maxResults });

  if (papers.length === 0) {
    console.log("未找到相关论文");
    return;
  }

  console.log(`找到 ${papers.length} 篇论文:\n`);

  papers.forEach((paper, index) => {
    console.log(formatPaper(paper, index + 1));
  });

  // 输出 BibTeX 格式（可选）
  console.log("\n📝 BibTeX 格式:");
  papers.forEach((paper, index) => {
    const authors = paper.authors
      .slice(0, 3)
      .map((a) => a.split(" ").pop())
      .join(" and ");

    console.log(`
@article{ref${index + 1},
  title={${paper.title}},
  author={${authors}},
  year={${new Date(paper.published).getFullYear()}},
  url={${paper.url}}
}`);
  });
}

main();
