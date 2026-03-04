import fs from "fs";
import path from "path";

// Load .env.local so the script works standalone via `npm run seed`
try {
  const envPath = path.join(process.cwd(), ".env.local");
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length)
      process.env[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
  }
} catch {}

import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { tools } from "../ai/tools";
import type { GitHubRepo, ProjectAnalysis, ToolResult } from "../types";

async function fetchRepos(username: string, hiddenRepos: string[]): Promise<GitHubRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=10&direction=desc`,
    { headers: { Accept: "application/vnd.github.v3+json" } }
  );
  if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
  const repos: GitHubRepo[] = await res.json();
  return repos.filter((r) => !hiddenRepos.includes(r.name));
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

async function main() {
  const configPath = path.join(process.cwd(), "public", "config", "config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const username = config.social.github.username;
  const hiddenRepos: string[] = config.social?.github?.hiddenRepos ?? [];

  console.log(`Fetching repos for ${username}...`);
  const repos = await fetchRepos(username, hiddenRepos);
  console.log(`Found ${repos.length} repos. Generating analyses...`);

  const results = await Promise.allSettled(
    repos.map(async (repo) => {
      console.log(`  Analyzing ${repo.name}...`);
      const analysis = await generateAnalysis(repo);
      console.log(`  ✓ ${repo.name}`);
      return analysis;
    })
  );

  const analyses: Record<string, ProjectAnalysis> = {};
  for (let i = 0; i < repos.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      analyses[repos[i].name] = result.value;
    } else {
      console.error(`  ✗ ${repos[i].name}:`, result.reason);
    }
  }

  const outPath = path.join(process.cwd(), "public", "config", "analyses.json");
  fs.writeFileSync(outPath, JSON.stringify(analyses, null, 2));
  console.log(`\nWrote ${Object.keys(analyses).length} analyses to ${outPath}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
