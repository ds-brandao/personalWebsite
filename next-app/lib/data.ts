import { Config, Article, GitHubRepo, GitHubCommit } from "@/types";
import type { ProjectAnalysis } from "@/types";
import fs from "fs";
import path from "path";

export async function getConfig(): Promise<Config> {
  const filePath = path.join(process.cwd(), "public", "config", "config.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export async function getArticles(): Promise<Article[]> {
  const filePath = path.join(
    process.cwd(),
    "public",
    "config",
    "articles.json"
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

const HIDDEN_REPOS = ["ds-brandao"];

export async function getGitHubRepos(
  username: string
): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=10&direction=desc`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) throw new Error("GitHub API failed");
    const repos: GitHubRepo[] = await res.json();
    return repos.filter((r) => !HIDDEN_REPOS.includes(r.name));
  } catch {
    try {
      const filePath = path.join(
        process.cwd(),
        "public",
        "config",
        "projects.json"
      );
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    } catch {
      return [];
    }
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
          headers: { Accept: "application/vnd.github.v3+json" },
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
    }
  }
  return commits;
}

export async function getProjectAnalyses(): Promise<Record<string, ProjectAnalysis>> {
  try {
    const filePath = path.join(process.cwd(), "public", "config", "analyses.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
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
