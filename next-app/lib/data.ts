import { Config, Article, GitHubRepo, GitHubCommit } from "@/types";
import fs from "fs";
import path from "path";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import configJson from "@/public/config/config.json";
import articlesJson from "@/public/config/articles.json";

// config.json / articles.json are bundled at build time (no filesystem at
// request time on Cloudflare Workers).
export async function getConfig(): Promise<Config> {
  return configJson;
}

export async function getArticles(): Promise<Article[]> {
  return articlesJson;
}

/**
 * Read a file from public/ — from disk in Node (next dev, Docker), from the
 * Worker's static assets binding on Cloudflare.
 */
async function readPublicFile(relPath: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), "public", relPath);
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    try {
      const { env } = getCloudflareContext();
      // Cast: we don't generate cloudflare-env.d.ts; ASSETS is the assets
      // binding declared in wrangler.jsonc.
      const assets = (
        env as { ASSETS?: { fetch: (input: URL) => Promise<Response> } }
      ).ASSETS;
      if (!assets) return null;
      const res = await assets.fetch(new URL(relPath, "https://assets.local"));
      return res.ok ? await res.text() : null;
    } catch {
      return null;
    }
  }
}

const HIDDEN_REPOS = ["ds-brandao"];

// Optional token raises the GitHub rate limit from 60/hr to 5000/hr
function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    // GitHub rejects requests without a User-Agent with 403. Node's fetch
    // sends one automatically; workerd's does not — so it must be explicit.
    "User-Agent": "personal-website (dbrandao.com)",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function getGitHubRepos(
  username: string
): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=10&direction=desc`,
      {
        headers: githubHeaders(),
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
    const repos: GitHubRepo[] = await res.json();
    return repos.filter((r) => !HIDDEN_REPOS.includes(r.name));
  } catch (err) {
    // Surfaces in Workers observability logs instead of failing silently
    console.error("getGitHubRepos failed:", err);
    return [];
  }
}

export async function getRepoCommits(
  owner: string,
  repos: GitHubRepo[]
): Promise<Record<string, GitHubCommit[]>> {
  const results = await Promise.allSettled(
    repos.map(async (repo) => {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo.name}/commits?per_page=3`,
        {
          headers: githubHeaders(),
          next: { revalidate: 300 },
        }
      );
      if (!res.ok) throw new Error(`Commits fetch failed for ${repo.name}`);
      const data = await res.json();
      return {
        name: repo.name,
        commits: data.map(
          (c: {
            sha: string;
            commit: {
              message: string;
              author: { name: string; date: string };
            };
          }): GitHubCommit => ({
            sha: c.sha,
            message: c.commit.message.split("\n")[0],
            authorName: c.commit.author.name,
            date: c.commit.author.date,
          })
        ),
      };
    })
  );

  const commits: Record<string, GitHubCommit[]> = {};
  for (const result of results) {
    if (result.status === "fulfilled") {
      commits[result.value.name] = result.value.commits;
    } else {
      console.error("getRepoCommits failed:", result.reason);
    }
  }
  return commits;
}

/** Estimated reading time in minutes from the article's markdown (~200 wpm). */
export async function getReadMinutes(
  markdownPath: string
): Promise<number | null> {
  const raw = await readPublicFile(markdownPath);
  if (!raw) return null;
  const words = raw.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Full markdown body for the article reader. */
export async function getArticleContent(article: Article): Promise<string> {
  return (await readPublicFile(article.markdown)) ?? "";
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const articles = await getArticles();
  return articles.find((a) => slugify(a.title) === slug) ?? null;
}
