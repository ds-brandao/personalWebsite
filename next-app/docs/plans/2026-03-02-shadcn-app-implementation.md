# shadcn App Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the scroll-driven single-page portfolio with a mobile-first tab-navigated app using shadcn components, Next.js App Router routes, and the existing warm Claude palette.

**Architecture:** Four routed tabs (Home, Articles, Projects, Profile) under a `(tabs)` route group with a shared layout providing bottom tab bar (mobile) and top navbar (desktop). Server components fetch data. Existing shadcn primitives and ai-elements reused throughout.

**Tech Stack:** Next.js 16 App Router, React 19, shadcn/ui (New York), Tailwind CSS 4, motion (Framer Motion), lucide-react

---

### Task 1: Create the (tabs) route group layout with BottomTabBar

**Files:**
- Create: `next-app/app/(tabs)/layout.tsx`
- Create: `next-app/components/BottomTabBar.tsx`

**Step 1: Create BottomTabBar component**

Create `next-app/components/BottomTabBar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Code, User } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/articles", label: "Articles", icon: FileText },
  { href: "/projects", label: "Projects", icon: Code },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();

  const activeTab = tabs.find(
    (tab) => tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
  );

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <div
        className="flex items-center gap-1 rounded-full px-2 py-2"
        style={{
          background: "var(--card)",
          boxShadow:
            "6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.6), inset 1px 1px 2px rgba(255,255,255,0.3)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab?.href === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-full text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "var(--background)",
                    boxShadow:
                      "3px 3px 6px rgba(0,0,0,0.06), -3px -3px 6px rgba(255,255,255,0.5)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon className="relative z-10 size-5" />
              <span className="relative z-10">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Step 2: Create TopNav component**

Create `next-app/components/TopNav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/projects", label: "Projects" },
  { href: "/profile", label: "Profile" },
];

export function TopNav({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 hidden md:block border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-bold text-foreground">
          {name}
        </Link>
        <nav className="flex items-center gap-6">
          {links.map((link) => {
            const isActive = link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

**Step 3: Create (tabs) layout**

Create `next-app/app/(tabs)/layout.tsx`:

```tsx
import { getConfig } from "@/lib/data";
import { TopNav } from "@/components/TopNav";
import { BottomTabBar } from "@/components/BottomTabBar";

export default async function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getConfig();

  return (
    <>
      <TopNav name={config.personal.name} />
      <main className="mx-auto max-w-5xl px-4 pb-24 md:pb-8 md:px-6">
        {children}
      </main>
      <BottomTabBar />
    </>
  );
}
```

**Step 4: Verify it compiles**

Run: `cd next-app && npx next build --no-lint 2>&1 | tail -20`
Expected: build succeeds (no pages yet, but layout should compile)

**Step 5: Commit**

```bash
git add next-app/components/BottomTabBar.tsx next-app/components/TopNav.tsx next-app/app/\(tabs\)/layout.tsx
git commit -m "feat: add tab navigation shell with BottomTabBar and TopNav"
```

---

### Task 2: Create Home page with activity feed

**Files:**
- Create: `next-app/app/(tabs)/page.tsx`

**Step 1: Create Home page server component**

Create `next-app/app/(tabs)/page.tsx`:

```tsx
import { getConfig, getGitHubRepos, getRepoCommits } from "@/lib/data";
import { HomeFeed } from "@/components/HomeFeed";

export const revalidate = 86400;

export default async function HomePage() {
  const config = await getConfig();
  const repos = await getGitHubRepos(config.social.github.username);
  const commits = await getRepoCommits(config.social.github.username, repos);

  return (
    <div className="py-8 md:py-12">
      {/* Hero */}
      <section className="mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          {config.personal.name}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">{config.personal.title}</p>
      </section>

      {/* Activity feed */}
      <section>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          Recent Activity
        </h2>
        <HomeFeed commits={commits} />
      </section>
    </div>
  );
}
```

**Step 2: Create HomeFeed client component**

Create `next-app/components/HomeFeed.tsx`:

```tsx
"use client";

import { GitHubCommit } from "@/types";
import {
  Commit,
  CommitHeader,
  CommitAuthor,
  CommitAuthorAvatar,
  CommitInfo,
  CommitMessage,
  CommitMetadata,
  CommitHash,
  CommitSeparator,
  CommitTimestamp,
  CommitActions,
  CommitCopyButton,
} from "@/components/ai-elements/commit";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";

interface HomeFeedProps {
  commits: Record<string, GitHubCommit[]>;
}

export function HomeFeed({ commits }: HomeFeedProps) {
  // Flatten and sort all commits by date (most recent first)
  const allCommits = Object.entries(commits)
    .flatMap(([repo, repoCommits]) =>
      repoCommits.map((c) => ({ ...c, repo }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15);

  return (
    <div className="space-y-3">
      {allCommits.map((commit, i) => (
        <motion.div
          key={commit.sha}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <Commit>
            <CommitHeader>
              <CommitAuthor>
                <CommitAuthorAvatar
                  initials={commit.authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                  className="mr-3"
                />
                <CommitInfo>
                  <div className="flex items-center gap-2">
                    <CommitMessage>{commit.message}</CommitMessage>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {commit.repo}
                    </Badge>
                  </div>
                  <CommitMetadata>
                    <CommitHash>{commit.sha.slice(0, 7)}</CommitHash>
                    <CommitSeparator />
                    <CommitTimestamp date={new Date(commit.date)} />
                  </CommitMetadata>
                </CommitInfo>
              </CommitAuthor>
              <CommitActions>
                <CommitCopyButton hash={commit.sha} />
              </CommitActions>
            </CommitHeader>
          </Commit>
        </motion.div>
      ))}
    </div>
  );
}
```

**Step 3: Verify it compiles and renders**

Run: `cd next-app && npx next build --no-lint 2>&1 | tail -20`
Expected: build succeeds

**Step 4: Commit**

```bash
git add next-app/app/\(tabs\)/page.tsx next-app/components/HomeFeed.tsx
git commit -m "feat: add Home page with commit activity feed"
```

---

### Task 3: Create Articles list page

**Files:**
- Create: `next-app/app/(tabs)/articles/page.tsx`
- Create: `next-app/components/ArticleCard.tsx`

**Step 1: Create ArticleCard component**

Create `next-app/components/ArticleCard.tsx`:

```tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
  slug: string;
}

export function ArticleCard({ article, slug }: ArticleCardProps) {
  return (
    <Link href={`/articles/${slug}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md group">
        {article.image && (
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              style={
                article.objectPosition
                  ? { objectPosition: article.objectPosition }
                  : undefined
              }
            />
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="font-display text-lg font-semibold text-foreground line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {article.summary}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

**Step 2: Create ArticlesFilter client component**

Create `next-app/components/ArticlesFilter.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Article } from "@/types";
import { ArticleCard } from "@/components/ArticleCard";
import { Toggle } from "@/components/ui/toggle";
import { motion, AnimatePresence } from "motion/react";

interface ArticlesFilterProps {
  articles: Article[];
  tags: string[];
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ArticlesFilter({ articles, tags }: ArticlesFilterProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? articles.filter((a) => a.tags.includes(activeTag))
    : articles;

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        <Toggle
          pressed={activeTag === null}
          onPressedChange={() => setActiveTag(null)}
          size="sm"
          className="rounded-full"
        >
          All
        </Toggle>
        {tags.map((tag) => (
          <Toggle
            key={tag}
            pressed={activeTag === tag}
            onPressedChange={() =>
              setActiveTag(activeTag === tag ? null : tag)
            }
            size="sm"
            className="rounded-full"
          >
            {tag}
          </Toggle>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((article) => (
            <motion.div
              key={article.title}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ArticleCard
                article={article}
                slug={slugify(article.title)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
```

**Step 3: Create articles page server component**

Create `next-app/app/(tabs)/articles/page.tsx`:

```tsx
import { getArticles, getConfig } from "@/lib/data";
import { ArticlesFilter } from "@/components/ArticlesFilter";

export const revalidate = 86400;

export default async function ArticlesPage() {
  const [articles, config] = await Promise.all([getArticles(), getConfig()]);
  const tags = Object.keys(config.tags);

  return (
    <div className="py-8 md:py-12">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
        Articles
      </h1>
      <ArticlesFilter articles={articles} tags={tags} />
    </div>
  );
}
```

**Step 4: Verify build**

Run: `cd next-app && npx next build --no-lint 2>&1 | tail -20`
Expected: build succeeds

**Step 5: Commit**

```bash
git add next-app/components/ArticleCard.tsx next-app/components/ArticlesFilter.tsx next-app/app/\(tabs\)/articles/page.tsx
git commit -m "feat: add Articles page with tag filtering and card grid"
```

---

### Task 4: Create Article detail page (/articles/[slug])

**Files:**
- Create: `next-app/app/(tabs)/articles/[slug]/page.tsx`
- Modify: `next-app/lib/data.ts` — add `getArticleBySlug()` helper

**Step 1: Add slugify + getArticleBySlug to lib/data.ts**

Add to end of `next-app/lib/data.ts`:

```ts
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
```

**Step 2: Create article detail page**

Create `next-app/app/(tabs)/articles/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getArticles, getArticleBySlug, slugify } from "@/lib/data";
import { ArticleReader } from "@/components/ArticleReader";

export const revalidate = 86400;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: slugify(a.title) }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Fetch markdown content at build time
  const fs = await import("fs");
  const path = await import("path");
  const mdPath = path.join(process.cwd(), "public", article.markdown);
  let content = "";
  try {
    content = fs.readFileSync(mdPath, "utf-8");
  } catch {
    content = "";
  }

  return <ArticleReader article={article} content={content} />;
}
```

**Step 3: Create ArticleReader client component**

Create `next-app/components/ArticleReader.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Article } from "@/types";
import { Mermaid } from "@/components/Mermaid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface ArticleReaderProps {
  article: Article;
  content: string;
}

export function ArticleReader({ article, content }: ArticleReaderProps) {
  const router = useRouter();

  return (
    <div className="py-6 md:py-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="mr-1 size-4" />
        Back
      </Button>

      {/* Hero image */}
      {article.image && (
        <div className="relative h-48 md:h-64 w-full overflow-hidden rounded-lg mb-6">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            style={
              article.objectPosition
                ? { objectPosition: article.objectPosition }
                : undefined
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>
      )}

      {/* Title + tags */}
      <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground leading-tight">
        {article.title}
      </h1>
      <div className="flex flex-wrap gap-2 mt-3 mb-8">
        {article.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Markdown */}
      <article
        className="prose prose-neutral dark:prose-invert max-w-none
          prose-headings:font-display prose-headings:font-bold
          prose-h1:text-xl prose-h1:mt-8 prose-h1:mb-4
          prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
          prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2
          prose-p:text-[15px] prose-p:leading-[1.75]
          prose-li:text-[15px] prose-li:leading-[1.75]
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:overflow-x-auto prose-pre:text-sm
          prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
          prose-img:rounded-lg
          prose-strong:text-foreground"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          components={{
            pre({ children, ...props }) {
              const child = Array.isArray(children) ? children[0] : children;
              if (child && typeof child === "object" && "props" in child) {
                const childProps = child.props as Record<string, unknown>;
                if (
                  typeof childProps.className === "string" &&
                  childProps.className.includes("language-mermaid")
                ) {
                  return (
                    <Mermaid chart={String(childProps.children).trim()} />
                  );
                }
              }
              return <pre {...props}>{children}</pre>;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
```

**Step 4: Verify build**

Run: `cd next-app && npx next build --no-lint 2>&1 | tail -20`
Expected: build succeeds, static params generated for all articles

**Step 5: Commit**

```bash
git add next-app/lib/data.ts next-app/app/\(tabs\)/articles/\[slug\]/page.tsx next-app/components/ArticleReader.tsx
git commit -m "feat: add full-page article reader with static generation"
```

---

### Task 5: Create Projects page

**Files:**
- Create: `next-app/app/(tabs)/projects/page.tsx`
- Create: `next-app/components/ProjectCard.tsx`
- Create: `next-app/components/ProjectGrid.tsx`

**Step 1: Create ProjectCard component**

Create `next-app/components/ProjectCard.tsx`:

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink } from "lucide-react";
import { GitHubRepo } from "@/types";
import { cn } from "@/lib/utils";

// Language colors (subset)
const langColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Shell: "#89e051",
  HCL: "#844FBA",
};

interface ProjectCardProps {
  repo: GitHubRepo;
  isSelected: boolean;
  onSelect: () => void;
}

export function ProjectCard({ repo, isSelected, onSelect }: ProjectCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-mono text-sm font-semibold text-foreground">
            {repo.name}
          </h3>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>
        {repo.description && (
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
            {repo.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          {repo.language && (
            <span className="flex items-center gap-1">
              <span
                className="size-2.5 rounded-full"
                style={{
                  backgroundColor: langColors[repo.language] ?? "var(--muted-foreground)",
                }}
              />
              {repo.language}
            </span>
          )}
          {repo.stargazers_count > 0 && (
            <span className="flex items-center gap-1">
              <Star className="size-3" />
              {repo.stargazers_count}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Create ProjectGrid client component**

Create `next-app/components/ProjectGrid.tsx`:

```tsx
"use client";

import { useState } from "react";
import { GitHubRepo, GitHubCommit } from "@/types";
import type { ProjectAnalysis } from "@/types";
import { ProjectCard } from "@/components/ProjectCard";
import {
  Commit,
  CommitHeader,
  CommitAuthor,
  CommitAuthorAvatar,
  CommitInfo,
  CommitMessage,
  CommitMetadata,
  CommitHash,
  CommitSeparator,
  CommitTimestamp,
  CommitActions,
  CommitCopyButton,
} from "@/components/ai-elements/commit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "motion/react";

interface ProjectGridProps {
  repos: GitHubRepo[];
  commits: Record<string, GitHubCommit[]>;
  analyses: Record<string, ProjectAnalysis>;
}

export function ProjectGrid({ repos, commits, analyses }: ProjectGridProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRepo = repos.find((r) => r.name === selected);
  const selectedCommits = selected ? commits[selected] ?? [] : [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {repos.map((repo) => (
          <ProjectCard
            key={repo.id}
            repo={repo}
            isSelected={selected === repo.name}
            onSelect={() =>
              setSelected(selected === repo.name ? null : repo.name)
            }
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedRepo && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-base">
                  {selectedRepo.name}
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-3">
                {selectedCommits.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No recent commits
                  </p>
                )}
                {selectedCommits.map((commit) => (
                  <Commit key={commit.sha}>
                    <CommitHeader>
                      <CommitAuthor>
                        <CommitAuthorAvatar
                          initials={commit.authorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                          className="mr-3"
                        />
                        <CommitInfo>
                          <CommitMessage>{commit.message}</CommitMessage>
                          <CommitMetadata>
                            <CommitHash>{commit.sha.slice(0, 7)}</CommitHash>
                            <CommitSeparator />
                            <CommitTimestamp date={new Date(commit.date)} />
                          </CommitMetadata>
                        </CommitInfo>
                      </CommitAuthor>
                      <CommitActions>
                        <CommitCopyButton hash={commit.sha} />
                      </CommitActions>
                    </CommitHeader>
                  </Commit>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

**Step 3: Create projects page server component**

Create `next-app/app/(tabs)/projects/page.tsx`:

```tsx
import {
  getConfig,
  getGitHubRepos,
  getRepoCommits,
  getProjectAnalyses,
} from "@/lib/data";
import { ProjectGrid } from "@/components/ProjectGrid";

export const revalidate = 86400;

export default async function ProjectsPage() {
  const config = await getConfig();
  const repos = await getGitHubRepos(config.social.github.username);
  const [commits, analyses] = await Promise.all([
    getRepoCommits(config.social.github.username, repos),
    getProjectAnalyses(),
  ]);

  return (
    <div className="py-8 md:py-12">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
        Projects
      </h1>
      <ProjectGrid repos={repos} commits={commits} analyses={analyses} />
    </div>
  );
}
```

**Step 4: Verify build**

Run: `cd next-app && npx next build --no-lint 2>&1 | tail -20`
Expected: build succeeds

**Step 5: Commit**

```bash
git add next-app/components/ProjectCard.tsx next-app/components/ProjectGrid.tsx next-app/app/\(tabs\)/projects/page.tsx
git commit -m "feat: add Projects page with card grid and commit detail panel"
```

---

### Task 6: Create Profile page

**Files:**
- Create: `next-app/app/(tabs)/profile/page.tsx`

**Step 1: Create profile page**

Create `next-app/app/(tabs)/profile/page.tsx`:

```tsx
import { getConfig } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";

export const revalidate = 86400;

export default async function ProfilePage() {
  const config = await getConfig();

  return (
    <div className="py-8 md:py-12 max-w-lg mx-auto">
      {/* Bio */}
      <section className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          {config.personal.name}
        </h1>
        <p className="mt-1 text-muted-foreground">{config.personal.title}</p>
      </section>

      {/* Socials */}
      <Card className="mb-6">
        <CardContent className="p-4 space-y-3">
          <a
            href={config.social.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Github className="size-5 text-muted-foreground" />
            <span>github.com/{config.social.github.username}</span>
          </a>
          <Separator />
          <a
            href={config.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Linkedin className="size-5 text-muted-foreground" />
            <span>LinkedIn</span>
          </a>
          <Separator />
          <a
            href={`mailto:${config.social.email}`}
            className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Mail className="size-5 text-muted-foreground" />
            <span>{config.social.email}</span>
          </a>
        </CardContent>
      </Card>

      {/* Featured */}
      {config.featured && config.featured.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Featured
          </h2>
          <div className="space-y-3">
            {config.featured.map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {item.source}
                      </Badge>
                    </div>
                    <ExternalLink className="size-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd next-app && npx next build --no-lint 2>&1 | tail -20`
Expected: build succeeds

**Step 3: Commit**

```bash
git add next-app/app/\(tabs\)/profile/page.tsx
git commit -m "feat: add Profile page with socials and featured mentions"
```

---

### Task 7: Wire up root page.tsx and clean up old components

**Files:**
- Modify: `next-app/app/page.tsx` — delete (now lives at `(tabs)/page.tsx`)
- Delete: `next-app/components/PageClient.tsx`
- Delete: `next-app/components/Hero.tsx`
- Delete: `next-app/components/ArticleSpread.tsx`
- Delete: `next-app/components/ArticleModal.tsx`
- Delete: `next-app/components/Articles.tsx`
- Delete: `next-app/components/Projects.tsx`
- Delete: `next-app/components/ProjectFrame.tsx`
- Delete: `next-app/components/ProjectDetail.tsx`
- Delete: `next-app/components/ParallaxDepth.tsx`
- Delete: `next-app/components/ScrollRevealText.tsx`
- Delete: `next-app/components/Footer.tsx`
- Delete: `next-app/components/Navbar.tsx`
- Delete: `next-app/components/penguin/PenguinCompanion.tsx`
- Delete: `next-app/components/penguin/sprites.ts`

**Step 1: Delete old root page.tsx**

The old `next-app/app/page.tsx` imports PageClient and passes all props. Delete it — the new `(tabs)/page.tsx` replaces it.

```bash
rm next-app/app/page.tsx
```

**Step 2: Delete all replaced components**

```bash
rm next-app/components/PageClient.tsx
rm next-app/components/Hero.tsx
rm next-app/components/ArticleSpread.tsx
rm next-app/components/ArticleModal.tsx
rm next-app/components/Articles.tsx
rm next-app/components/Projects.tsx
rm next-app/components/ProjectFrame.tsx
rm next-app/components/ProjectDetail.tsx
rm next-app/components/ParallaxDepth.tsx
rm next-app/components/ScrollRevealText.tsx
rm next-app/components/Footer.tsx
rm next-app/components/Navbar.tsx
rm -rf next-app/components/penguin/
```

**Step 3: Verify build succeeds with no broken imports**

Run: `cd next-app && npx next build --no-lint 2>&1 | tail -30`
Expected: build succeeds, no missing module errors

**Step 4: Commit**

```bash
git add -A next-app/app/page.tsx next-app/components/
git commit -m "chore: remove old single-page components, wire up tab routes"
```

---

### Task 8: Clean up globals.css

**Files:**
- Modify: `next-app/globals.css`

**Step 1: Remove unused animation CSS**

Remove the float/drift keyframes and animation variables from `globals.css` since they're no longer used. Keep the palette, scrollbar, and base styles.

Remove these lines from the `@theme inline` block:
```css
  /* Animations */
  --animate-float: float 6s ease-in-out infinite;
  --animate-drift: drift 8s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes drift {
    0%, 100% { transform: translate(0, 0); }
    33% { transform: translate(5px, -8px); }
    66% { transform: translate(-3px, -4px); }
  }
```

**Step 2: Verify build**

Run: `cd next-app && npx next build --no-lint 2>&1 | tail -20`
Expected: build succeeds

**Step 3: Commit**

```bash
git add next-app/app/globals.css
git commit -m "chore: remove unused animation CSS from globals"
```

---

### Task 9: Visual QA and dark mode verification

**Step 1: Start dev server**

Run: `cd next-app && npx next dev`

**Step 2: Verify each route**

Check in browser:
- `/` — hero + commit feed renders, stagger animation works
- `/articles` — tag filters work, cards render with images
- `/articles/<any-slug>` — full article renders with markdown, back button works
- `/projects` — grid renders, clicking a card expands commit detail
- `/profile` — socials + featured render

**Step 3: Verify responsive navigation**

- Mobile viewport (< 768px): bottom tab bar visible, top nav hidden, tab pill animates between tabs
- Desktop viewport (>= 768px): top nav visible, bottom tab bar hidden

**Step 4: Verify dark mode**

- Toggle theme via ThemeToggle
- All pages should adapt (warm dark palette)
- Neumorphic tab bar shadows should still look reasonable in dark mode (may need shadow adjustment)

**Step 5: Fix any issues found, commit**

```bash
git add -A
git commit -m "fix: visual QA adjustments"
```

---

### Task 10: Final dark-mode shadow fix for BottomTabBar

The neumorphic shadows use light-mode assumptions (white highlight shadows). For dark mode, adjust.

**Files:**
- Modify: `next-app/components/BottomTabBar.tsx`

**Step 1: Add dark-mode-aware shadows**

Update the shadow styles in `BottomTabBar.tsx` to use CSS variables or conditional classes. Replace the hardcoded `rgba(255,255,255,0.6)` with theme-aware values:

```tsx
// In the outer div, replace style with:
className="... dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(255,255,255,0.05)]"
style={{
  background: "var(--card)",
  boxShadow: undefined, // move to className
}}
```

Or use a simpler approach: on dark mode, use a subtle border instead of neumorphic shadows.

**Step 2: Verify in both themes**

**Step 3: Commit**

```bash
git add next-app/components/BottomTabBar.tsx
git commit -m "fix: dark-mode shadow adjustments for BottomTabBar"
```
