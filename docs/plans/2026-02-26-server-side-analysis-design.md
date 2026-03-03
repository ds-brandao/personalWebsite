# Server-Side Project Analysis with ISR

**Date:** 2026-02-26
**Status:** Approved

## Problem

The `/api/chat` and `/api/project-analysis` routes expose the OpenAI API key to abuse. Any browser can call these unauthenticated endpoints and burn through API credits.

## Solution

Move all OpenAI calls into the server-side data layer. Analyses are generated at build time and revalidated once per day via Next.js ISR. No public API routes touch OpenAI.

## Data Flow

```
Build / ISR revalidate (every 86400s)
  ├─ getGitHubRepos() → fetch repos from GitHub API
  ├─ For each repo → generateAnalysis() → call OpenAI server-side
  └─ Return repos + analyses as props to page component

Client receives:
  repos: GitHubRepo[]
  analyses: Record<string, ProjectAnalysis>
  → No API calls, just renders pre-computed data
```

## Changes

### `lib/data.ts` — Add `getProjectAnalyses(repos)`

- Takes repos array from `getGitHubRepos`
- For each repo, calls `generateText` with OpenAI (same prompt/tools as current route)
- Returns `Record<string, ProjectAnalysis>` keyed by repo name
- Uses `Promise.allSettled` to parallelize — one failure doesn't block others
- Failed repos return null (graceful degradation)

### `app/page.tsx`

- Call `getProjectAnalyses(repos)` after `getGitHubRepos`
- Pass `analyses` through to `PageClient`

### `PageClient.tsx`

- Accept `analyses` prop, pass through to `Projects`

### `Projects.tsx`

- Receive `analyses` prop
- Remove `useProjectAnalysis` hook
- Look up `analyses[selectedRepo.name]` and pass to `ProjectDetail`

### `ProjectDetail.tsx`

- Remove `isLoading` prop (data is always pre-computed or absent)
- If `analysis` is null, show "Visit GitHub" fallback

## Files to Delete

| File | Reason |
|---|---|
| `app/api/chat/route.ts` | No client-side AI calls needed |
| `app/api/project-analysis/route.ts` | Replaced by server-side `getProjectAnalyses` |
| `lib/analysis-cache.ts` | Replaced by Next.js ISR cache |
| `lib/use-project-analysis.ts` | No client-side fetching needed |

## ISR Strategy

- `getGitHubRepos`: `revalidate: 300` (5 min, already exists)
- `getProjectAnalyses`: `revalidate: 86400` (24h)
- Page revalidates when either cache expires

## Security Outcome

- Zero public API routes that touch OpenAI
- No way for a browser to trigger OpenAI calls
- `OPENAI_API_KEY` only used server-side during build/revalidation
