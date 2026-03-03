# Seed Analyses Build Script — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move AI project analyses from runtime rendering to a pre-generated static JSON file, eliminating ~8s of OpenAI API calls from every page render.

**Architecture:** A standalone `scripts/seed-analyses.ts` script fetches GitHub repos and calls OpenAI to generate analyses, writing results to `public/config/analyses.json`. The runtime `getProjectAnalyses()` becomes a simple file read. The `generateAnalysis` function and all AI SDK imports move out of `lib/data.ts` entirely.

**Tech Stack:** tsx (script runner), ai SDK + @ai-sdk/openai (existing deps), Node fs/path

---

### Task 1: Create the seed script

**Files:**
- Create: `next-app/scripts/seed-analyses.ts`

**Step 1: Write the seed script**

The script reuses the existing `generateAnalysis` logic (moved here from `lib/data.ts`) with relative imports to avoid path alias issues.

```typescript
import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { tools } from "../ai/tools";
import type { GitHubRepo, ProjectAnalysis, ToolResult } from "../types";
import fs from "fs";
import path from "path";

const HIDDEN_REPOS = ["ds-brandao"];

async function fetchRepos(username: string): Promise<GitHubRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=10&direction=desc`,
    { headers: { Accept: "application/vnd.github.v3+json" } }
  );
  if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
  const repos: GitHubRepo[] = await res.json();
  return repos.filter((r) => !HIDDEN_REPOS.includes(r.name));
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
  // Read config to get GitHub username
  const configPath = path.join(process.cwd(), "public", "config", "config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const username = config.social.github.username;

  console.log(`Fetching repos for ${username}...`);
  const repos = await fetchRepos(username);
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
```

**Step 2: Verify it runs**

Run from `next-app/` directory:
```bash
npx tsx scripts/seed-analyses.ts
```

Expected: Generates `public/config/analyses.json` with analysis data for each repo. Should take ~5-10s (one-time cost).

**Step 3: Commit**

```bash
git add scripts/seed-analyses.ts public/config/analyses.json
git commit -m "feat: add seed script to pre-generate project analyses"
```

---

### Task 2: Simplify `getProjectAnalyses()` to a file read

**Files:**
- Modify: `next-app/lib/data.ts`

**Step 1: Replace `getProjectAnalyses` and remove `generateAnalysis`**

Remove:
- The `generateAnalysis` function (lines 58-100) — now lives in the seed script
- The old `getProjectAnalyses` body (lines 146-164) — replace with file read
- Unused imports: `generateText`, `stepCountIs` from `ai`; `openai` from `@ai-sdk/openai`; `tools` from `@/ai/tools`

The new `getProjectAnalyses` reads the static JSON file and returns `{}` if the file doesn't exist (graceful fallback):

```typescript
export async function getProjectAnalyses(): Promise<Record<string, ProjectAnalysis>> {
  try {
    const filePath = path.join(process.cwd(), "public", "config", "analyses.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
```

Note: signature changes from `(repos: GitHubRepo[])` to `()` — no longer needs repos.

**Step 2: Verify the import cleanup**

After removing AI imports, `lib/data.ts` should only import:
```typescript
import { Config, Article, GitHubRepo, GitHubCommit } from "@/types";
import type { ProjectAnalysis } from "@/types";
import fs from "fs";
import path from "path";
```

**Step 3: Commit**

```bash
git add lib/data.ts
git commit -m "refactor: simplify getProjectAnalyses to read static JSON"
```

---

### Task 3: Update `page.tsx` call site and add npm script

**Files:**
- Modify: `next-app/app/page.tsx`
- Modify: `next-app/package.json`

**Step 1: Update page.tsx**

`getProjectAnalyses` no longer takes `repos` as an argument. Update the call:

```typescript
const [analyses, commits] = await Promise.all([
  getProjectAnalyses(),
  getRepoCommits(config.social.github.username, repos),
]);
```

**Step 2: Add seed script to package.json**

Add to `"scripts"`:
```json
"seed": "tsx scripts/seed-analyses.ts"
```

Also add `tsx` as a devDependency (for reliable local execution without npx download):
```json
"devDependencies": {
  "tsx": "^4"
}
```

**Step 3: Verify the full flow**

```bash
cd next-app
npm install
npm run seed          # generates analyses.json
npm run dev           # page should render in <1s
```

**Step 4: Commit**

```bash
git add app/page.tsx package.json package-lock.json
git commit -m "wire up seed script and update page to use static analyses"
```

---

### Dead code to remove

After these changes, the following are no longer used anywhere in the runtime app and should be confirmed removed in Task 2:

- `generateAnalysis()` function in `lib/data.ts`
- `import { generateText, stepCountIs } from "ai"` in `lib/data.ts`
- `import { openai } from "@ai-sdk/openai"` in `lib/data.ts`
- `import { tools } from "@/ai/tools"` in `lib/data.ts`

The `ai`, `@ai-sdk/openai` packages stay in `dependencies` since the seed script uses them. The `ai/tools.ts` file stays since the seed script imports it.
