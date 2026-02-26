# Server-Side Project Analysis Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move OpenAI project analysis from public API routes to server-side data fetching with daily ISR, eliminating the API key abuse surface.

**Architecture:** `getProjectAnalyses()` in `lib/data.ts` calls OpenAI for each repo at build/ISR time. Results flow as props through `page.tsx` → `PageClient` → `Projects` → `ProjectDetail`. No public API routes touch OpenAI.

**Tech Stack:** Next.js 15 ISR, Vercel AI SDK (`generateText`), `@ai-sdk/openai`

---

### Task 1: Add `getProjectAnalyses()` to `lib/data.ts`

**Files:**
- Modify: `next-app/lib/data.ts`

**Step 1: Add imports and the `generateAnalysis` helper**

Add to the top of `lib/data.ts`:

```typescript
import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { tools } from "@/ai/tools";
import type { ProjectAnalysis, ToolResult } from "@/types";
```

Then add the private helper (lifted from `app/api/project-analysis/route.ts`):

```typescript
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
```

**Step 2: Add the public `getProjectAnalyses` function**

```typescript
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
    }
  }

  return analyses;
}
```

**Step 3: Verify no syntax errors**

Run: `cd next-app && npx tsc --noEmit`
Expected: No errors from `lib/data.ts`

**Step 4: Commit**

```bash
git add next-app/lib/data.ts
git commit -m "feat: add server-side getProjectAnalyses to data layer"
```

---

### Task 2: Wire analyses through `page.tsx` and `PageClient.tsx`

**Files:**
- Modify: `next-app/app/page.tsx`
- Modify: `next-app/components/PageClient.tsx`

**Step 1: Update `page.tsx` to fetch and pass analyses**

Replace full contents of `next-app/app/page.tsx`:

```typescript
import {
  getConfig,
  getArticles,
  getGitHubRepos,
  getProjectAnalyses,
} from "@/lib/data";
import { PageClient } from "@/components/PageClient";

export const revalidate = 86400; // 24 hours

export default async function Home() {
  const config = await getConfig();
  const articles = await getArticles();
  const repos = await getGitHubRepos(config.social.github.username);
  const analyses = await getProjectAnalyses(repos);

  return (
    <PageClient
      config={config}
      articles={articles}
      repos={repos}
      analyses={analyses}
    />
  );
}
```

**Step 2: Update `PageClient.tsx` to accept and pass analyses**

Add `ProjectAnalysis` to the import:

```typescript
import { Config, Article, GitHubRepo, ProjectAnalysis } from "@/types";
```

Add `analyses` to the interface:

```typescript
interface PageClientProps {
  config: Config;
  articles: Article[];
  repos: GitHubRepo[];
  analyses: Record<string, ProjectAnalysis>;
}
```

Update the function signature:

```typescript
export function PageClient({ config, articles, repos, analyses }: PageClientProps) {
```

Update the `Projects` component usage:

```tsx
<Projects repos={repos} analyses={analyses} />
```

**Step 3: Verify types**

Run: `cd next-app && npx tsc --noEmit`
Expected: Errors only in `Projects.tsx` (it doesn't accept `analyses` yet — that's Task 3)

**Step 4: Commit**

```bash
git add next-app/app/page.tsx next-app/components/PageClient.tsx
git commit -m "feat: wire project analyses from server through page props"
```

---

### Task 3: Update `Projects.tsx` to use prop-based analyses

**Files:**
- Modify: `next-app/components/Projects.tsx`

**Step 1: Replace `useProjectAnalysis` hook with prop lookup**

Replace full contents of `next-app/components/Projects.tsx`:

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GitHubRepo, ProjectAnalysis } from "@/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectDetail } from "./ProjectDetail";

interface ProjectsProps {
  repos: GitHubRepo[];
  analyses: Record<string, ProjectAnalysis>;
}

export function Projects({ repos, analyses }: ProjectsProps) {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(
    repos[0] ?? null
  );

  const analysis = selectedRepo ? analyses[selectedRepo.name] ?? null : null;

  return (
    <div className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
      <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-8">
        Projects
      </h2>

      {/* Horizontal scroll - desktop */}
      <div className="hidden md:block overflow-x-auto overflow-y-visible pb-4 scrollbar-thin">
        <motion.div
          className="flex gap-6 p-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {repos.map((repo) => (
            <motion.div
              key={repo.id}
              variants={{
                hidden: { opacity: 0, x: 30 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <ProjectCard
                repo={repo}
                isSelected={selectedRepo?.id === repo.id}
                onClick={() => setSelectedRepo(repo)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Vertical stack - mobile */}
      <div className="md:hidden flex flex-col gap-4">
        {repos.map((repo) => (
          <ProjectCard
            key={repo.id}
            repo={repo}
            isSelected={selectedRepo?.id === repo.id}
            onClick={() => setSelectedRepo(repo)}
          />
        ))}
      </div>

      {/* AI-powered detail panel */}
      <AnimatePresence mode="wait">
        {selectedRepo && (
          <motion.div
            key={selectedRepo.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="mt-8 bg-surface-1 rounded-xl border border-surface-3/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold text-text-primary">
                {selectedRepo.name}
              </h3>
              <a
                href={selectedRepo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ember hover:text-ember-glow transition-colors"
              >
                View on GitHub &rarr;
              </a>
            </div>
            <ProjectDetail
              analysis={analysis}
              repoUrl={selectedRepo.html_url}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 2: Verify types**

Run: `cd next-app && npx tsc --noEmit`
Expected: Errors only in `ProjectDetail.tsx` (still expects old props — that's Task 4)

**Step 3: Commit**

```bash
git add next-app/components/Projects.tsx
git commit -m "refactor: use server-provided analyses instead of client hook"
```

---

### Task 4: Simplify `ProjectDetail.tsx`

**Files:**
- Modify: `next-app/components/ProjectDetail.tsx`

**Step 1: Remove loading state, simplify props**

Replace the interface and component function (keep `renderToolResult` unchanged):

```typescript
interface ProjectDetailProps {
  analysis: ProjectAnalysis | null;
  repoUrl: string;
}

export function ProjectDetail({ analysis, repoUrl }: ProjectDetailProps) {
  if (!analysis) {
    return (
      <div className="text-text-secondary p-4">
        <p className="text-text-muted text-sm">
          AI analysis unavailable. Visit{" "}
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember hover:text-ember-glow"
          >
            GitHub
          </a>{" "}
          for details.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {analysis.toolResults.map((tr, i) => renderToolResult(tr, i))}
    </motion.div>
  );
}
```

Remove the `AnimatePresence` import since it's no longer needed. The imports become:

```typescript
"use client";

import { motion } from "motion/react";
import type { ProjectAnalysis, ToolResult } from "@/types";
```

**Step 2: Verify full type check passes**

Run: `cd next-app && npx tsc --noEmit`
Expected: PASS — no type errors

**Step 3: Commit**

```bash
git add next-app/components/ProjectDetail.tsx
git commit -m "refactor: simplify ProjectDetail to render pre-computed analysis"
```

---

### Task 5: Delete dead code

**Files:**
- Delete: `next-app/app/api/chat/route.ts`
- Delete: `next-app/app/api/project-analysis/route.ts`
- Delete: `next-app/lib/analysis-cache.ts`
- Delete: `next-app/lib/use-project-analysis.ts`

**Step 1: Remove files**

```bash
rm next-app/app/api/chat/route.ts
rm -r next-app/app/api/project-analysis
rm next-app/lib/analysis-cache.ts
rm next-app/lib/use-project-analysis.ts
```

**Step 2: Check if `app/api/chat/` directory is now empty and remove it**

```bash
rmdir next-app/app/api/chat 2>/dev/null || true
```

If `app/api/` is now empty, remove it too:

```bash
rmdir next-app/app/api 2>/dev/null || true
```

**Step 3: Verify no broken imports**

Run: `cd next-app && npx tsc --noEmit`
Expected: PASS — nothing imports the deleted files anymore

**Step 4: Commit**

```bash
git add -A next-app/app/api next-app/lib/analysis-cache.ts next-app/lib/use-project-analysis.ts
git commit -m "chore: remove public API routes and client-side analysis code

OpenAI calls now happen server-side only via ISR.
Deleted: /api/chat, /api/project-analysis, analysis-cache, use-project-analysis"
```

---

### Task 6: Verify build succeeds

**Step 1: Run full build**

Run: `cd next-app && npm run build`
Expected: Build succeeds. The page should be statically generated with ISR revalidation.

**Step 2: Verify no API routes exist**

Run: `ls -R next-app/app/api 2>&1`
Expected: "No such file or directory" — confirms no public API surface

**Step 3: Commit if any fixups were needed, otherwise done**
