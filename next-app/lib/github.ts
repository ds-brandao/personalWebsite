import "server-only";

import { cache } from "react";
import type { GitHubRepo, GitHubCommit } from "@/types";

const HIDDEN_REPOS = new Set(["ds-brandao"]);
const REVALIDATE_SECONDS = 300;
const REQUEST_TIMEOUT_MS = 5_000;

async function fetchGitHub<T>(resource: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "personal-website (dbrandao.com)",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com/${resource}`, {
    headers,
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`GitHub ${resource}: ${response.status}`);
  return response.json() as Promise<T>;
}

export const getGitHubRepos = cache(async (username: string): Promise<GitHubRepo[]> => {
  try {
    const repos = await fetchGitHub<GitHubRepo[]>(
      `users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10&direction=desc`
    );
    // Pass only fields the UI uses across the server/client boundary.
    return repos.filter((repo) => !HIDDEN_REPOS.has(repo.name)).map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      homepage: repo.homepage,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      topics: repo.topics,
      pushed_at: repo.pushed_at,
    }));
  } catch (error) {
    console.error("getGitHubRepos failed:", error);
    return [];
  }
});

interface ApiCommit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string } | null;
    committer: { name: string; date: string } | null;
  };
}

export const getRepoCommits = cache(async (
  owner: string,
  repoName: string
): Promise<GitHubCommit[]> => {
  try {
    const commits = await fetchGitHub<ApiCommit[]>(
      `repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/commits?per_page=3`
    );
    return commits.flatMap(({ sha, commit }) => {
      const author = commit.author ?? commit.committer;
      return author ? [{
        sha,
        message: commit.message.split("\n")[0],
        authorName: author.name,
        date: author.date,
      }] : [];
    });
  } catch (error) {
    console.error("getRepoCommits failed:", error);
    return [];
  }
});

/** Home sections share one snapshot without repeating repository/commit work. */
export const getGitHubData = cache(async (username: string) => {
  const repos = await getGitHubRepos(username);
  const entries = await Promise.all(repos.map(async (repo) => [
    repo.name,
    await getRepoCommits(username, repo.name),
  ] as const));
  return { repos, commits: Object.fromEntries(entries) };
});
