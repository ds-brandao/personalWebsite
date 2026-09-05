import "server-only";

import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Article, ArticleListItem } from "@/types";
import articlesJson from "@/public/config/articles.json";

export function getArticles(): Article[] {
  return articlesJson;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getArticleBySlug(slug: string): Article | null {
  return getArticles().find((article) => slugify(article.title) === slug) ?? null;
}

function getAssets() {
  // Development and prerendering use the source files, not a previous
  // OpenNext build's assets. A deployed Worker has no source filesystem.
  if (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD
  ) return undefined;

  try {
    return (getCloudflareContext().env as {
      ASSETS?: { fetch: (input: URL) => Promise<Response> };
    }).ASSETS;
  } catch {
    return undefined; // Local Node/Docker production server.
  }
}

/** One read per article per server render, shared by cards and the reader. */
const readMarkdown = cache(async (markdownPath: string): Promise<string> => {
  const assets = getAssets();
  if (assets) {
    const response = await assets.fetch(new URL(markdownPath, "https://assets.local"));
    if (!response.ok) throw new Error(`Article unavailable: ${markdownPath}`);
    return response.text();
  }

  return readFile(path.join(process.cwd(), "public", markdownPath), "utf-8");
});

export async function getArticleContent(article: Article): Promise<string> {
  return readMarkdown(article.markdown);
}

export const getArticleList = cache(async (limit?: number): Promise<ArticleListItem[]> => {
  const articles = [...getArticles()]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  return Promise.all(articles.map(async (article) => {
    const content = await readMarkdown(article.markdown);
    return {
      article,
      slug: slugify(article.title),
      readMinutes: content.trim()
        ? Math.max(1, Math.round(content.trim().split(/\s+/).length / 200))
        : null,
    };
  }));
});
