import { Config, Article, GitHubRepo } from "@/types";
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
    return res.json();
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
