import { Config, Article, GitHubRepo } from "@/types";
import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { tools } from "@/ai/tools";
import type { ProjectAnalysis, ToolResult } from "@/types";
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

async function generateAnalysis(repo: GitHubRepo): Promise<ProjectAnalysis> {
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    system: `You are a project analyzer for a developer portfolio. When given information about a GitHub repository, use the available tools to display rich UI components.

IMPORTANT: Only communicate through tool calls. Do NOT include any text responses — all information must be presented via the tools. Do not summarize or repeat what the tools display.

Use these tools to give a comprehensive overview:
- displayPackageInfo for the top 3-5 dependencies
- displayCodeSnippet for one interesting code pattern or entry point
- displayFileStructure for project organization
- displaySetupCommand for how to install/run

Call all relevant tools in a single response.`,
    messages: [
      {
        role: "user",
        content: `Analyze this GitHub project and display rich UI components for it:
- Name: ${repo.name}
- Description: ${repo.description || "No description"}
- Language: ${repo.language || "Unknown"}
- Stars: ${repo.stargazers_count}
- URL: ${repo.html_url}`,
      },
    ],
    stopWhen: stepCountIs(1),
    tools,
  });

  const toolResults: ToolResult[] = [];
  for (const toolResult of result.toolResults) {
    toolResults.push({
      toolName: toolResult.toolName as ToolResult["toolName"],
      result: toolResult.output as Record<string, unknown>,
    });
  }

  return {
    repoName: repo.name,
    toolResults,
    cachedAt: new Date().toISOString(),
  };
}

export async function getProjectAnalyses(
  repos: GitHubRepo[]
): Promise<Record<string, ProjectAnalysis>> {
  const results = await Promise.allSettled(
    repos.map((repo) => generateAnalysis(repo))
  );

  const analyses: Record<string, ProjectAnalysis> = {};
  for (let i = 0; i < repos.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      analyses[repos[i].name] = result.value;
    } else {
      console.error(`Analysis failed for ${repos[i].name}:`, result.reason);
    }
  }

  return analyses;
}
