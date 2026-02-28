# Article Reader Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the modal-based article viewer with an inline section takeover that transitions the articles grid into a full reader view with prev/next navigation.

**Architecture:** The `Articles` component owns a `selectedArticle` state and conditionally renders either the article grid or a new `ArticleReader` component. `PageClient` no longer manages article selection or renders `ArticleModal`. Transitions use Framer Motion `AnimatePresence mode="wait"`.

**Tech Stack:** React, TypeScript, Framer Motion (motion/react), ReactMarkdown, Mermaid, Tailwind CSS, lucide-react icons

---

### Task 1: Create ArticleReader component

**Files:**
- Create: `next-app/components/ArticleReader.tsx`

**Step 1: Create the ArticleReader component**

This component receives the selected article, the full articles array (for prev/next), and an `onBack` callback. It fetches and renders the markdown content inline.

```tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Article } from "@/types";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Mermaid } from "./Mermaid";

interface ArticleReaderProps {
  article: Article;
  articles: Article[];
  onBack: () => void;
  onNavigate: (article: Article) => void;
}

export function ArticleReader({ article, articles, onBack, onNavigate }: ArticleReaderProps) {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);

  const currentIndex = useMemo(
    () => articles.findIndex((a) => a.title === article.title),
    [articles, article.title]
  );
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  // Fetch markdown content
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(article.markdown)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) {
          setMarkdown(text);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMarkdown("Failed to load article content.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [article.markdown]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
      if (e.key === "ArrowLeft" && prevArticle) onNavigate(prevArticle);
      if (e.key === "ArrowRight" && nextArticle) onNavigate(nextArticle);
    },
    [onBack, onNavigate, prevArticle, nextArticle]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
      {/* Sticky nav bar */}
      <div className="sticky top-0 z-20 -mx-6 md:-mx-12 lg:-mx-20 px-6 md:px-12 lg:px-20 py-3 bg-bg/80 backdrop-blur-md border-b border-surface-3/50 mb-8 flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-ember transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline text-sm">Back to articles</span>
        </button>

        <span className="font-display text-sm text-text-secondary truncate text-center flex-1">
          {article.title}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => prevArticle && onNavigate(prevArticle)}
            disabled={!prevArticle}
            className="p-1.5 rounded-md text-text-secondary hover:text-ember disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous article"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => nextArticle && onNavigate(nextArticle)}
            disabled={!nextArticle}
            className="p-1.5 rounded-md text-text-secondary hover:text-ember disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next article"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Hero image */}
      <div className="relative h-[35vh] overflow-hidden rounded-t-xl">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
          style={{ objectPosition: article.objectPosition || "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-3">
            {article.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="tag-base border-ember/40 text-ember bg-ember/10">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={article.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-surface-1 rounded-b-xl px-6 md:px-12 py-10"
        >
          <div className="max-w-3xl mx-auto">
            {loading ? (
              <div className="space-y-4">
                {[85, 92, 78, 95, 70, 88].map((w, i) => (
                  <div
                    key={i}
                    className="h-4 bg-surface-2 rounded animate-pulse"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="font-display text-3xl font-bold text-text-primary mt-8 mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="font-display text-2xl font-semibold text-text-primary mt-6 mb-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-display text-xl font-semibold text-text-primary mt-5 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-text-secondary leading-relaxed mb-4">{children}</p>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ember hover:text-ember-glow underline underline-offset-2 transition-colors"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="bg-surface-2 text-ember-glow px-1.5 py-0.5 rounded text-sm font-mono">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children, ...props }) => {
                    const child = Array.isArray(children) ? children[0] : children;
                    if (
                      child &&
                      typeof child === "object" &&
                      "props" in child &&
                      typeof child.props?.className === "string" &&
                      child.props.className.includes("language-mermaid")
                    ) {
                      const text = String(child.props.children).trim();
                      return <Mermaid chart={text} />;
                    }
                    return (
                      <pre className="bg-surface-2 rounded-lg p-4 overflow-x-auto text-sm mb-4" {...props}>
                        {children}
                      </pre>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-ember/50 pl-4 italic text-text-muted my-4">
                      {children}
                    </blockquote>
                  ),
                  img: ({ src, alt }) => (
                    <img src={src} alt={alt || ""} className="rounded-lg my-4 w-full" />
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-text-secondary space-y-1 mb-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-text-secondary space-y-1 mb-4">
                      {children}
                    </ol>
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom prev/next navigation */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        {prevArticle ? (
          <button
            onClick={() => onNavigate(prevArticle)}
            className="flex items-center gap-3 p-4 bg-surface-1 rounded-xl border border-surface-3/50 hover:border-ember/30 transition-colors text-left group"
          >
            <ChevronLeft size={16} className="text-text-muted group-hover:text-ember shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-text-muted mb-1">Previous</div>
              <div className="text-sm text-text-primary font-medium truncate">{prevArticle.title}</div>
            </div>
          </button>
        ) : (
          <div />
        )}
        {nextArticle ? (
          <button
            onClick={() => onNavigate(nextArticle)}
            className="flex items-center justify-end gap-3 p-4 bg-surface-1 rounded-xl border border-surface-3/50 hover:border-ember/30 transition-colors text-right group"
          >
            <div className="min-w-0">
              <div className="text-xs text-text-muted mb-1">Next</div>
              <div className="text-sm text-text-primary font-medium truncate">{nextArticle.title}</div>
            </div>
            <ChevronRight size={16} className="text-text-muted group-hover:text-ember shrink-0" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify types compile**

Run: `cd next-app && npx tsc --noEmit`
Expected: No errors (component isn't imported anywhere yet, but types should be valid)

**Step 3: Commit**

```bash
git add next-app/components/ArticleReader.tsx
git commit -m "feat: add ArticleReader inline component"
```

---

### Task 2: Update Articles to manage selection state and render ArticleReader

**Files:**
- Modify: `next-app/components/Articles.tsx`

**Step 1: Rewrite Articles.tsx with dual-mode rendering**

Replace the entire file with this version that manages `selectedArticle` state internally and toggles between grid and reader views:

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Article, Config } from "@/types";
import { ArticleCard } from "./ArticleCard";
import { ArticleReader } from "./ArticleReader";

interface ArticlesProps {
  articles: Article[];
  tags: Config["tags"];
}

export function Articles({ articles, tags }: ArticlesProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const tagNames = Object.keys(tags);
  const filtered = activeTag
    ? articles.filter((a) => a.tags.includes(activeTag))
    : articles;

  const scrollToSection = useCallback(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleArticleClick = useCallback(
    (article: Article) => {
      setSelectedArticle(article);
      scrollToSection();
    },
    [scrollToSection]
  );

  const handleBack = useCallback(() => {
    setSelectedArticle(null);
    scrollToSection();
  }, [scrollToSection]);

  const handleNavigate = useCallback(
    (article: Article) => {
      setSelectedArticle(article);
      scrollToSection();
    },
    [scrollToSection]
  );

  return (
    <div ref={sectionRef}>
      <AnimatePresence mode="wait">
        {selectedArticle ? (
          <motion.div
            key="reader"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <ArticleReader
              article={selectedArticle}
              articles={articles}
              onBack={handleBack}
              onNavigate={handleNavigate}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-8">
              Writing
            </h2>

            {/* Tag filters */}
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => setActiveTag(null)}
                className={`tag-base ${
                  activeTag === null
                    ? "border-ember text-ember bg-ember/10"
                    : "border-surface-3 text-text-muted hover:text-text-secondary hover:border-surface-3"
                }`}
              >
                All
              </button>
              {tagNames.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                  className={`tag-base ${
                    activeTag === tag
                      ? "border-ember text-ember bg-ember/10"
                      : "border-surface-3 text-text-muted hover:text-text-secondary hover:border-surface-3"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Bento grid */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((article, i) => (
                  <motion.div
                    key={article.title}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={i === 0 ? "md:col-span-2" : ""}
                  >
                    <ArticleCard
                      article={article}
                      featured={i === 0}
                      onClick={() => handleArticleClick(article)}
                      tagColors={tags}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

Key changes:
- Removed `onArticleClick` prop — state is internal now
- Added `selectedArticle` state
- Wrapped grid and reader in `AnimatePresence mode="wait"` for swap transitions
- Added `sectionRef` for scroll-to-top on transitions
- Passes full `articles` array to `ArticleReader` for prev/next navigation

**Step 2: Verify types compile**

Run: `cd next-app && npx tsc --noEmit`
Expected: Error in `PageClient.tsx` because `Articles` no longer accepts `onArticleClick` prop. That's expected — we fix it in Task 3.

**Step 3: Commit**

```bash
git add next-app/components/Articles.tsx
git commit -m "feat: add inline reader mode to Articles section"
```

---

### Task 3: Update PageClient and delete ArticleModal

**Files:**
- Modify: `next-app/components/PageClient.tsx`
- Delete: `next-app/components/ArticleModal.tsx`

**Step 1: Update PageClient.tsx**

Remove `selectedArticle` state, remove `ArticleModal` import and rendering, remove the `onArticleClick` prop from `Articles`.

The new file:

```tsx
"use client";

import { useState } from "react";
import { Config, Article, GitHubRepo, ProjectAnalysis, GitHubCommit } from "@/types";
import { EmberCanvas } from "./EmberCanvas";
import { LoadingScreen } from "./LoadingScreen";
import { SceneContainer } from "./SceneContainer";
import { Hero } from "./Hero";
import { Articles } from "./Articles";
import { Projects } from "./Projects";
import { DotNav } from "./DotNav";
import { Footer } from "./Footer";
import { PenguinCompanion } from "./penguin";

interface PageClientProps {
  config: Config;
  articles: Article[];
  repos: GitHubRepo[];
  analyses: Record<string, ProjectAnalysis>;
  commits: Record<string, GitHubCommit[]>;
}

export function PageClient({ config, articles, repos, analyses, commits }: PageClientProps) {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      <EmberCanvas className="fixed inset-0 z-0" />
      <PenguinCompanion />

      <main className="relative z-10">
        <SceneContainer id="hero">
          <Hero config={config} />
        </SceneContainer>

        <SceneContainer id="articles" minHeight>
          <Articles articles={articles} tags={config.tags} />
        </SceneContainer>

        <SceneContainer id="projects" minHeight>
          <Projects repos={repos} analyses={analyses} commits={commits} />
        </SceneContainer>

        <Footer config={config} />
      </main>

      <DotNav />
    </>
  );
}
```

**Step 2: Delete ArticleModal.tsx**

```bash
rm next-app/components/ArticleModal.tsx
```

**Step 3: Verify types compile and build succeeds**

Run: `cd next-app && npx tsc --noEmit && npm run build`
Expected: Clean compile, successful build

**Step 4: Commit**

```bash
git add next-app/components/PageClient.tsx
git rm next-app/components/ArticleModal.tsx
git commit -m "refactor: remove modal, wire inline article reader"
```

---

### Task 4: Docker build and verify

**Files:** None (verification only)

**Step 1: Rebuild and start Docker dev container**

```bash
cd /Users/danielbrandao/Documents/proxmox/websitev2
docker compose down
docker compose up dev -d --build
```

**Step 2: Wait for server and verify page loads**

```bash
sleep 15
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```
Expected: `200`

**Step 3: Verify article markdown is accessible**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/blog-posts/fan-in-out.md
```
Expected: `200`

**Step 4: Manual verification checklist**

Open `http://localhost:3000` in browser and verify:
- [ ] Articles grid renders with all 6 articles
- [ ] Clicking an article transitions to reader view (no modal)
- [ ] Article content loads and renders markdown
- [ ] Mermaid diagrams render (fan-in-out article)
- [ ] Sticky nav shows back button, title, prev/next
- [ ] Prev/next buttons navigate between articles
- [ ] Bottom prev/next cards show and work
- [ ] Escape key returns to grid
- [ ] Arrow keys navigate between articles
- [ ] Back button returns to grid with smooth transition
