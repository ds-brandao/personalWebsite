# Typewriter Reel — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the portfolio from stacked sections into a cinematic scrollytelling experience with scroll-linked hero typography, full-bleed editorial articles, horizontal project reel, and scripted penguin narrator.

**Architecture:** Four "scenes" occupy full viewport height (or more). Vertical scroll drives all transitions via `motion/react`'s `useScroll` + `useTransform`. The horizontal projects reel uses the tall-container + sticky + translateX pattern. Penguin appears at scripted scroll positions instead of free-roaming. SporeCanvas and LoadingScreen are deleted.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, motion/react (useScroll/useTransform/whileInView), shadcn/ui, next-themes. No new dependencies.

**Verification:** All tasks verified via `docker compose up dev --build` (dev server at localhost:3000) and `npx tsc --noEmit` inside the container. We do NOT use local npm commands.

**Existing palette & fonts stay:** Claude Color Palette, Fraunces display, Plus Jakarta Sans body — all unchanged.

---

### Task 1: Create ScrollRevealText Component

A reusable component that reveals text word-by-word as you scroll through its container. Used by the Articles section header and potentially other places.

**Files:**
- Create: `components/ScrollRevealText.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "motion/react";

interface ScrollRevealTextProps {
  text: string;
  className?: string;
  as?: "h2" | "h3" | "p" | "span";
}

function AnimatedWord({
  word,
  progress,
  index,
  total,
}: {
  word: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.15, 1]);

  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.25em]">
      {word}
    </motion.span>
  );
}

export function ScrollRevealText({
  text,
  className,
  as: Tag = "p",
}: ScrollRevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.3"],
  });

  const words = text.split(" ");

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={className}>
      {words.map((word, i) => (
        <AnimatedWord
          key={i}
          word={word}
          progress={scrollYProgress}
          index={i}
          total={words.length}
        />
      ))}
    </Tag>
  );
}
```

**Step 2: Verify types compile**

Run inside the Docker container:
```bash
docker compose exec dev npx tsc --noEmit
```
Expected: No errors related to ScrollRevealText.

**Step 3: Commit**

```bash
git add next-app/components/ScrollRevealText.tsx
git commit -m "feat: add ScrollRevealText component for scroll-linked word reveal"
```

---

### Task 2: Rewrite Hero Section — Scroll-Linked Typography

Replace the current fade-in hero with a scroll-driven typographic experience. Name fills the screen, letter-spacing expands as you scroll, subtitle fades up through the gaps, entire composition exits upward.

**Files:**
- Modify: `components/Hero.tsx` (full rewrite)

**Context:**
- `Config` type: `config.personal.name` = "Daniel Brandao", `config.social.email`, `config.social.linkedin`, `config.social.github.url`
- Currently uses `motion` fade-up variants. Replace entirely with `useScroll` + `useTransform`.
- Hero container has `id="hero"` set by PageClient's wrapping div.

**Step 1: Rewrite Hero.tsx**

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Mail, Linkedin, Github } from "lucide-react";
import { Config } from "@/types";

export function Hero({ config }: { config: Config }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Name: letter-spacing expands as you scroll
  const letterSpacing = useTransform(scrollYProgress, [0, 0.5], ["0em", "0.4em"]);
  // Subtitle: fades in and slides up
  const subtitleOpacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);
  const subtitleY = useTransform(scrollYProgress, [0.15, 0.4], [40, 0]);
  // Social icons: staggered fade
  const socialsOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const socialsY = useTransform(scrollYProgress, [0.3, 0.5], [30, 0]);
  // Exit: everything fades and rises
  const exitOpacity = useTransform(scrollYProgress, [0.6, 1], [1, 0]);
  const exitY = useTransform(scrollYProgress, [0.6, 1], [0, -120]);

  return (
    <div ref={containerRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <motion.div style={{ opacity: exitOpacity, y: exitY }} className="flex flex-col items-center">
          <motion.h1
            style={{ letterSpacing }}
            className="font-display text-[clamp(3rem,15vw,12rem)] font-black leading-[0.9] tracking-tight text-foreground whitespace-nowrap"
          >
            {config.personal.name}
          </motion.h1>

          <motion.p
            style={{ opacity: subtitleOpacity, y: subtitleY }}
            className="mt-6 text-lg md:text-2xl text-muted-foreground font-sans"
          >
            Software Engineer
          </motion.p>

          <motion.div
            style={{ opacity: socialsOpacity, y: socialsY }}
            className="flex items-center gap-4 mt-10"
          >
            {[
              { href: `mailto:${config.social.email}`, label: "Email", Icon: Mail },
              { href: config.social.linkedin, label: "LinkedIn", Icon: Linkedin },
              { href: config.social.github.url, label: "GitHub", Icon: Github },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                aria-label={label}
                className="p-3 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
```

**Key points for the implementer:**
- Container is `h-[200vh]` — this creates the scroll distance for the animations.
- Inner content is `sticky top-0 h-screen` — it stays pinned while the outer container scrolls.
- `scrollYProgress` goes from 0 to 1 as you scroll through the 200vh container.
- The name font size uses `clamp(3rem,15vw,12rem)` — massive on desktop, scales down on mobile.
- `whitespace-nowrap` on the h1 prevents the name from wrapping as letter-spacing increases.
- The scroll-down arrow from the old Hero is REMOVED — the scroll itself is the invitation.

**Step 2: Verify**

```bash
docker compose exec dev npx tsc --noEmit
```

Visually: load localhost:3000, the name should fill the screen. Scrolling should expand letter spacing, reveal subtitle, then fade everything out.

**Step 3: Commit**

```bash
git add next-app/components/Hero.tsx
git commit -m "feat: rewrite Hero with scroll-linked letter-spacing expansion"
```

---

### Task 3: Create ArticleSpread Component

New component replacing ArticleCard. Each article is a full-bleed editorial spread — large title on the left, image on the right with parallax.

**Files:**
- Create: `components/ArticleSpread.tsx`

**Context:**
- `Article` type: `{ title, summary, markdown, image, objectPosition?, tags }`.
- `Config["tags"]` is `Record<string, { color: string; description: string }>`.

**Step 1: Create ArticleSpread.tsx**

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Article, Config } from "@/types";

interface ArticleSpreadProps {
  article: Article;
  tags: Config["tags"];
  onClick: () => void;
}

export function ArticleSpread({ article, tags, onClick }: ArticleSpreadProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Image parallax: moves slower than scroll (0.7x)
  const imageY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      onClick={onClick}
      className="group cursor-pointer grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10 items-center min-h-[60vh] py-16"
    >
      {/* Left: Text (3/5 on desktop) */}
      <div className="md:col-span-3 space-y-4">
        <h3 className="font-display text-3xl md:text-5xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
          {article.title}
        </h3>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
          {article.summary}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {article.tags.map((tag) => {
            const tagDef = tags[tag];
            return (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground border-l-2"
                style={{ borderLeftColor: tagDef?.color || "var(--primary)" }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>

      {/* Right: Image with parallax (2/5 on desktop) */}
      {article.image && (
        <div className="md:col-span-2 relative overflow-hidden rounded-xl h-64 md:h-80">
          <motion.img
            src={article.image}
            alt={article.title}
            style={{ y: imageY }}
            className="w-full h-[130%] object-cover absolute inset-0"
            {...(article.objectPosition ? { style: { y: imageY, objectPosition: article.objectPosition } } : { style: { y: imageY } })}
          />
        </div>
      )}
    </motion.div>
  );
}
```

**Step 2: Verify types compile**

```bash
docker compose exec dev npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add next-app/components/ArticleSpread.tsx
git commit -m "feat: add ArticleSpread component for full-bleed editorial layout"
```

---

### Task 4: Rewrite Articles Section

Replace the masonry grid with full-bleed editorial spreads. Uses ScrollRevealText for the heading and ArticleSpread for each article.

**Files:**
- Modify: `components/Articles.tsx` (full rewrite)

**Context:**
- `ArticlesProps`: `{ articles: Article[]; tags: Config["tags"]; onArticleClick: (article: Article) => void }`
- Tag filtering stays (Toggle pills). AnimatePresence for filter transitions.
- ScrollRevealText from Task 1 for the heading.
- ArticleSpread from Task 3 for each article.

**Step 1: Rewrite Articles.tsx**

```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Article, Config } from "@/types";
import { ArticleSpread } from "./ArticleSpread";
import { ScrollRevealText } from "./ScrollRevealText";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

interface ArticlesProps {
  articles: Article[];
  tags: Config["tags"];
  onArticleClick: (article: Article) => void;
}

export function Articles({ articles, tags, onArticleClick }: ArticlesProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? articles.filter((a) => a.tags.includes(activeTag))
    : articles;

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <ScrollRevealText
        text="Writing"
        as="h2"
        className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4"
      />
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground mb-10 max-w-lg text-lg"
      >
        Thoughts on software engineering, security, and building things.
      </motion.p>

      {/* Tag filters — sticky below navbar */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md py-4 -mx-6 px-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <Toggle
            pressed={activeTag === null}
            onPressedChange={() => setActiveTag(null)}
            className="rounded-full text-xs"
            size="sm"
          >
            All
          </Toggle>
          {Object.entries(tags).map(([key]) => (
            <Toggle
              key={key}
              pressed={activeTag === key}
              onPressedChange={() => setActiveTag(activeTag === key ? null : key)}
              className="rounded-full text-xs"
              size="sm"
            >
              {key}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Editorial article spreads */}
      <div>
        <AnimatePresence mode="popLayout">
          {filtered.map((article, i) => (
            <motion.div
              key={article.title}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArticleSpread
                article={article}
                tags={tags}
                onClick={() => onArticleClick(article)}
              />
              {i < filtered.length - 1 && <Separator className="my-0" />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
```

**Key points:**
- Tag filter bar is `sticky top-16` (below the 16-unit-high navbar) with backdrop blur.
- Articles separated by `<Separator>` lines instead of grid gaps.
- Each ArticleSpread is `min-h-[60vh]` — generous vertical space.
- AnimatePresence wraps the filtered list for smooth tag transitions.

**Step 2: Verify**

```bash
docker compose exec dev npx tsc --noEmit
```

Visually: Articles should appear as full-width editorial spreads with image parallax.

**Step 3: Commit**

```bash
git add next-app/components/Articles.tsx
git commit -m "feat: rewrite Articles as full-bleed editorial spreads with sticky filter bar"
```

---

### Task 5: Create ProjectFrame Component

New component replacing ProjectCard for the horizontal scroll reel. Each project is a full-frame "slide."

**Files:**
- Create: `components/ProjectFrame.tsx`

**Context:**
- `GitHubRepo` type: `{ id, name, description, html_url, homepage, language, stargazers_count, forks_count }`.
- Language color map from current ProjectCard.

**Step 1: Create ProjectFrame.tsx**

```tsx
"use client";

import { Star, ExternalLink } from "lucide-react";
import { GitHubRepo } from "@/types";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

interface ProjectFrameProps {
  repo: GitHubRepo;
  selected: boolean;
  onClick: () => void;
}

export function ProjectFrame({ repo, selected, onClick }: ProjectFrameProps) {
  const langColor = repo.language ? LANG_COLORS[repo.language] || "#7E6E5C" : "#7E6E5C";

  return (
    <div
      onClick={onClick}
      className={`relative flex-shrink-0 w-[85vw] md:w-[70vw] h-full flex flex-col justify-end p-8 md:p-12 cursor-pointer rounded-2xl border transition-all duration-300 ${
        selected
          ? "border-primary bg-card shadow-lg"
          : "border-border/50 bg-card/50 hover:border-primary/40 hover:bg-card/80"
      }`}
    >
      {/* Subtle language color wash */}
      <div
        className="absolute inset-0 rounded-2xl opacity-[0.04]"
        style={{ backgroundColor: langColor }}
      />

      <div className="relative z-10">
        <h3 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
          {repo.name}
        </h3>
        {repo.description && (
          <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-6 leading-relaxed">
            {repo.description}
          </p>
        )}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          {repo.language && (
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: langColor }}
              />
              {repo.language}
            </span>
          )}
          {repo.stargazers_count > 0 && (
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4" />
              {repo.stargazers_count}
            </span>
          )}
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify types compile**

```bash
docker compose exec dev npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add next-app/components/ProjectFrame.tsx
git commit -m "feat: add ProjectFrame component for horizontal scroll reel"
```

---

### Task 6: Rewrite Projects Section — Horizontal Scroll Reel

Replace the card grid with a horizontal scroll driven by vertical scrolling. Uses the tall-container + sticky + translateX pattern.

**Files:**
- Modify: `components/Projects.tsx` (full rewrite)

**Context:**
- `ProjectsProps`: `{ repos: GitHubRepo[]; analyses: Record<string, ProjectAnalysis>; commits: Record<string, GitHubCommit[]> }`
- ProjectFrame from Task 5 for each project.
- ProjectDetail stays as-is for the expanded view.
- `useScroll` + `useTransform` for the horizontal translation.

**Step 1: Rewrite Projects.tsx**

```tsx
"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { GitHubRepo, ProjectAnalysis, GitHubCommit } from "@/types";
import { ProjectFrame } from "./ProjectFrame";
import { ProjectDetail } from "./ProjectDetail";
import { ScrollRevealText } from "./ScrollRevealText";

interface ProjectsProps {
  repos: GitHubRepo[];
  analyses: Record<string, ProjectAnalysis>;
  commits: Record<string, GitHubCommit[]>;
}

export function Projects({ repos, analyses, commits }: ProjectsProps) {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalFrames = repos.length + 1; // +1 for the title frame
  const containerHeight = `${(totalFrames + 1) * 100}vh`;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress to horizontal translation
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `${-((totalFrames - 1) / totalFrames) * 100}%`]
  );

  // Progress bar width
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const handleSelect = (repo: GitHubRepo) => {
    setSelectedRepo(selectedRepo?.name === repo.name ? null : repo);
  };

  return (
    <div ref={containerRef} style={{ height: containerHeight }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        {/* Scrolling track */}
        <div className="flex-1 flex items-center">
          <motion.div
            style={{ x }}
            className="flex gap-6 px-6"
            // Total width: all frames at their widths + gaps
          >
            {/* Title frame */}
            <div className="flex-shrink-0 w-[85vw] md:w-[70vw] h-[70vh] flex flex-col justify-center">
              <h2 className="font-display text-5xl md:text-8xl font-bold text-foreground mb-4">
                Projects
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-md">
                Open source work and side projects.
              </p>
            </div>

            {/* Project frames */}
            {repos.map((repo) => (
              <ProjectFrame
                key={repo.name}
                repo={repo}
                selected={selectedRepo?.name === repo.name}
                onClick={() => handleSelect(repo)}
              />
            ))}
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-border/30 mx-6 mb-6 rounded-full overflow-hidden">
          <motion.div
            style={{ width: progressWidth }}
            className="h-full bg-primary rounded-full"
          />
        </div>

        {/* Expanded project detail */}
        <AnimatePresence>
          {selectedRepo && (
            <motion.div
              key={selectedRepo.name}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-md max-h-[40vh]"
            >
              <div className="p-6 overflow-y-auto max-h-[38vh]">
                <ProjectDetail
                  repo={selectedRepo}
                  analysis={analyses[selectedRepo.name]}
                  commits={commits[selectedRepo.name] || []}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

**Key points for the implementer:**
- Outer container height is `(totalFrames + 1) * 100vh` — this creates the scroll distance for horizontal movement.
- Inner container is `sticky top-0 h-screen` — stays pinned while outer scrolls.
- `x` transform maps `scrollYProgress [0,1]` to `["0%", "-{calc}%"]` — this slides the flex row left.
- Title frame is the first "slide" — it shows "Projects" heading before project cards.
- Each ProjectFrame is `w-[85vw] md:w-[70vw]` — nearly full width with a gap peek.
- Progress bar at the bottom shows scroll position through the reel.
- ProjectDetail expands as a panel at the bottom of the sticky container.
- The `h-[70vh]` on the title frame and the use of `items-center` on the track container vertically centers the frames within the viewport.

**Step 2: Verify**

```bash
docker compose exec dev npx tsc --noEmit
```

Visually: Scroll into the projects section — should see "Projects" title, then horizontal scrolling through project frames as you scroll vertically. Progress bar should animate at the bottom.

**Step 3: Commit**

```bash
git add next-app/components/Projects.tsx
git commit -m "feat: rewrite Projects as horizontal scroll reel driven by vertical scroll"
```

---

### Task 7: Rewrite Footer — Cinematic Closing

Replace the simple separator + links footer with a full-viewport cinematic fade-to-black.

**Files:**
- Modify: `components/Footer.tsx` (full rewrite)

**Context:**
- `Config` type: `config.personal.name`, `config.social.email`, `config.social.linkedin`, `config.social.github.url`
- The footer should use scroll-linked opacity to transition to Deep Noir (#0E0A08).

**Step 1: Rewrite Footer.tsx**

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Mail, Linkedin, Github } from "lucide-react";
import { Config } from "@/types";

export function Footer({ config }: { config: Config }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  });

  const bgOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0.3, 0.8], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.3, 0.8], [40, 0]);

  return (
    <footer ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Dark overlay that fades in */}
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 bg-claude-noir"
      />

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 flex flex-col items-center text-center gap-8"
      >
        <h2 className="font-display text-4xl md:text-6xl font-bold text-claude-taupe">
          {config.personal.name}
        </h2>

        <div className="flex items-center gap-6">
          {[
            { href: `mailto:${config.social.email}`, label: "Email", Icon: Mail },
            { href: config.social.linkedin, label: "LinkedIn", Icon: Linkedin },
            { href: config.social.github.url, label: "GitHub", Icon: Github },
          ].map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              aria-label={label}
              className="p-3 rounded-full border border-claude-muted-brown text-claude-taupe hover:text-claude-rust hover:border-claude-rust transition-colors"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>

        <span className="text-sm text-claude-muted-brown">
          &copy; {new Date().getFullYear()} {config.personal.name}
        </span>
      </motion.div>
    </footer>
  );
}
```

**Key points:**
- Footer is now a `"use client"` component (was server component before) because it uses `useScroll`.
- `bg-claude-noir` uses the `#0E0A08` color token from globals.css.
- Text uses the hardcoded Claude palette token classes (`text-claude-taupe`, `text-claude-muted-brown`, `border-claude-muted-brown`) so they don't change with theme — the footer is always "dark" regardless of theme setting.
- The `bgOpacity` transition from 0→1 creates the fade-to-black effect as you scroll into the footer.

**Step 2: Verify**

```bash
docker compose exec dev npx tsc --noEmit
```

Visually: Scroll to the bottom — background should fade to near-black, name and social icons appear centered.

**Step 3: Commit**

```bash
git add next-app/components/Footer.tsx
git commit -m "feat: rewrite Footer as cinematic fade-to-black closing scene"
```

---

### Task 8: Update Navbar — Add Scroll Progress Bar

Add a thin scroll progress indicator to the navbar. Keep existing behavior (transparent on hero, blur on scroll, mobile menu).

**Files:**
- Modify: `components/Navbar.tsx`

**Step 1: Add scroll progress bar**

Add these imports at the top:
```tsx
import { motion, useScroll, useTransform } from "motion/react";
```

Remove the existing `motion` import (which only imports `motion`).

Inside the component, before the return, add:
```tsx
const { scrollYProgress } = useScroll();
const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
```

At the bottom of the `<motion.header>`, after the mobile menu, add the progress bar:
```tsx
{/* Scroll progress bar */}
<motion.div
  style={{ width: progressWidth }}
  className="absolute bottom-0 left-0 h-0.5 bg-primary"
/>
```

**Step 2: Verify**

```bash
docker compose exec dev npx tsc --noEmit
```

Visually: A thin rust-colored line should grow at the bottom of the navbar as you scroll.

**Step 3: Commit**

```bash
git add next-app/components/Navbar.tsx
git commit -m "feat: add scroll progress bar to Navbar"
```

---

### Task 9: Create ParallaxDepth Background Layer

Replace SporeCanvas (canvas particle system) with a lightweight CSS parallax background of large blurred palette circles.

**Files:**
- Create: `components/ParallaxDepth.tsx`

**Step 1: Create ParallaxDepth.tsx**

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const CIRCLES = [
  { x: "10%", y: "15%", size: "30vw", color: "var(--color-claude-taupe)", opacity: 0.06 },
  { x: "70%", y: "40%", size: "25vw", color: "var(--color-claude-cream)", opacity: 0.05 },
  { x: "40%", y: "70%", size: "35vw", color: "var(--color-claude-taupe)", opacity: 0.04 },
  { x: "85%", y: "20%", size: "20vw", color: "var(--color-claude-muted-brown)", opacity: 0.03 },
  { x: "20%", y: "90%", size: "28vw", color: "var(--color-claude-cream)", opacity: 0.05 },
];

export function ParallaxDepth() {
  const { scrollY } = useScroll();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {CIRCLES.map((circle, i) => (
        <ParallaxCircle key={i} circle={circle} scrollY={scrollY} index={i} />
      ))}
    </div>
  );
}

function ParallaxCircle({
  circle,
  scrollY,
  index,
}: {
  circle: (typeof CIRCLES)[0];
  scrollY: ReturnType<typeof useScroll>["scrollY"];
  index: number;
}) {
  // Each circle moves at a different parallax rate
  const rate = 0.03 + index * 0.01;
  const y = useTransform(scrollY, (v) => v * -rate);

  return (
    <motion.div
      style={{
        left: circle.x,
        top: circle.y,
        width: circle.size,
        height: circle.size,
        y,
        opacity: circle.opacity,
        backgroundColor: circle.color,
      }}
      className="absolute rounded-full blur-3xl"
    />
  );
}
```

**Key points:**
- Five large blurred circles at fixed positions, each moving at a slightly different parallax rate.
- Uses `var(--color-claude-*)` tokens so they respond to theme changes.
- Very low opacity (0.03–0.06) — atmospheric, not distracting.
- `blur-3xl` creates the soft, diffused look.
- Much lighter than a canvas animation loop — pure CSS + GPU-composited transforms.

**Step 2: Verify**

```bash
docker compose exec dev npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add next-app/components/ParallaxDepth.tsx
git commit -m "feat: add ParallaxDepth background layer replacing SporeCanvas"
```

---

### Task 10: Rewrite Penguin as Scroll-Scripted Narrator

Replace the free-roaming physics penguin with scripted appearances at specific scroll positions. The penguin peeks in during transitions between scenes.

**Files:**
- Modify: `components/penguin/PenguinCompanion.tsx` (full rewrite)
- Keep: `components/penguin/sprites.ts` (unchanged)
- Delete: `components/penguin/waypoints.ts`
- Delete: `components/penguin/behavior.ts`

**Context:**
- The sprite system (`PENGUIN_PALETTE`, `ANIMATIONS`, `PIXEL_SCALE`, `SPRITE_WIDTH`, `SPRITE_HEIGHT`, `SpriteFrame`, `PenguinState`) stays as-is.
- The penguin appears at 3 scripted positions tied to page scroll progress:
  1. Peeks from right edge during hero → articles transition (~scroll 15-25%)
  2. Sits on the progress bar during horizontal projects scroll (~scroll 50-75%)
  3. Waves goodbye in the footer (~scroll 90-100%)

**Step 1: Rewrite PenguinCompanion.tsx**

```tsx
"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import {
  PENGUIN_PALETTE,
  ANIMATIONS,
  PIXEL_SCALE,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  type PenguinState,
  type SpriteFrame,
} from "./sprites";

const PENGUIN_W = SPRITE_WIDTH * PIXEL_SCALE;
const PENGUIN_H = SPRITE_HEIGHT * PIXEL_SCALE;

interface ScriptedAppearance {
  scrollRange: [number, number]; // [start, end] of scroll progress (0-1)
  getPosition: (progress: number, viewW: number, viewH: number) => { x: number; y: number };
  state: PenguinState;
  flipH: boolean;
}

const APPEARANCES: ScriptedAppearance[] = [
  {
    // Peek from right during hero → articles transition
    scrollRange: [0.1, 0.2],
    getPosition: (progress, viewW, viewH) => {
      // Slide in from right edge
      const t = (progress - 0.1) / 0.1; // 0→1 within range
      const x = viewW - PENGUIN_W * t;
      const y = viewH * 0.5;
      return { x, y };
    },
    state: "idle-look",
    flipH: true,
  },
  {
    // Sit during projects horizontal scroll
    scrollRange: [0.45, 0.75],
    getPosition: (_progress, viewW, viewH) => {
      const x = viewW * 0.05;
      const y = viewH - PENGUIN_H - 40; // above the progress bar
      return { x, y };
    },
    state: "sit",
    flipH: false,
  },
  {
    // Wave goodbye in footer
    scrollRange: [0.88, 1.0],
    getPosition: (progress, viewW, viewH) => {
      const t = (progress - 0.88) / 0.12;
      const x = viewW * 0.5 - PENGUIN_W / 2;
      const y = viewH * 0.6 - PENGUIN_H * t * 0.3; // slight float up
      return { x, y };
    },
    state: "dance",
    flipH: false,
  },
];

export function PenguinCompanion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const stateRef = useRef<PenguinState>("idle");
  const frameIndexRef = useRef(0);
  const frameTimerRef = useRef(0);
  const lastTimeRef = useRef(0);
  const posRef = useRef({ x: -100, y: -100 });
  const flipRef = useRef(false);
  const visibleRef = useRef(false);
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    let found = false;
    for (const appearance of APPEARANCES) {
      const [start, end] = appearance.scrollRange;
      if (progress >= start && progress <= end) {
        const viewW = window.innerWidth;
        const viewH = window.innerHeight;
        const pos = appearance.getPosition(progress, viewW, viewH);
        posRef.current = pos;
        flipRef.current = appearance.flipH;
        found = true;

        if (stateRef.current !== appearance.state) {
          stateRef.current = appearance.state;
          frameIndexRef.current = 0;
          frameTimerRef.current = 0;
        }
        break;
      }
    }
    visibleRef.current = found;
  });

  const drawSprite = useCallback(
    (ctx: CanvasRenderingContext2D, frame: SpriteFrame, screenX: number, screenY: number, flipH: boolean) => {
      ctx.save();
      if (flipH) {
        ctx.translate(screenX + PENGUIN_W, screenY);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(screenX, screenY);
      }
      for (let row = 0; row < frame.length; row++) {
        for (let col = 0; col < frame[row].length; col++) {
          const colorIdx = frame[row][col];
          if (colorIdx === 0) continue;
          ctx.fillStyle = PENGUIN_PALETTE[colorIdx];
          ctx.fillRect(col * PIXEL_SCALE, row * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
        }
      }
      ctx.restore();
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };
    resize();
    window.addEventListener("resize", resize);
    lastTimeRef.current = performance.now();

    const animate = (now: number) => {
      const dt = Math.min(now - lastTimeRef.current, 50);
      lastTimeRef.current = now;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      if (visibleRef.current) {
        const state = stateRef.current;
        const anim = ANIMATIONS[state];

        // Frame advancement
        frameTimerRef.current += dt;
        if (frameTimerRef.current >= anim.frameDuration) {
          frameTimerRef.current -= anim.frameDuration;
          frameIndexRef.current++;
          if (frameIndexRef.current >= anim.frames.length) {
            frameIndexRef.current = anim.loop ? 0 : anim.frames.length - 1;
          }
        }

        const frame = anim.frames[frameIndexRef.current] ?? anim.frames[0];
        drawSprite(ctx, frame, posRef.current.x, posRef.current.y, flipRef.current);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [drawSprite]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-30 hidden md:block pointer-events-none"
      style={{ imageRendering: "pixelated" }}
      aria-label="Penguin narrator"
      role="img"
    />
  );
}
```

**Step 2: Delete waypoints.ts and behavior.ts**

```bash
rm next-app/components/penguin/waypoints.ts
rm next-app/components/penguin/behavior.ts
```

**Step 3: Verify**

```bash
docker compose exec dev npx tsc --noEmit
```

Visually: Scroll through the page — penguin should peek from the right during hero-to-articles transition, sit during projects, and dance in the footer.

**Step 4: Commit**

```bash
git add -A next-app/components/penguin/
git commit -m "feat: rewrite penguin as scroll-scripted narrator, delete waypoints and behavior"
```

---

### Task 11: Restructure PageClient — Wire Scenes Together

Update PageClient to use the new scene-based layout. Remove SporeCanvas, remove LoadingScreen, add ParallaxDepth.

**Files:**
- Modify: `components/PageClient.tsx` (rewrite)

**Context:**
- Current PageClient imports: SporeCanvas, LoadingScreen, Navbar, Hero, Articles, Projects, ArticleModal, Footer, PenguinCompanion.
- New PageClient: ParallaxDepth (replaces SporeCanvas), NO LoadingScreen, same Navbar/Hero/Articles/Projects/Footer/PenguinCompanion/ArticleModal.
- Remove the `loading` state (no loading screen).
- Remove the `paper-grain` class from main (the parallax depth layer replaces it).

**Step 1: Rewrite PageClient.tsx**

```tsx
"use client";

import { useState } from "react";
import { Config, Article, GitHubRepo, ProjectAnalysis, GitHubCommit } from "@/types";
import { ParallaxDepth } from "./ParallaxDepth";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Articles } from "./Articles";
import { Projects } from "./Projects";
import { ArticleModal } from "./ArticleModal";
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
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <>
      <ParallaxDepth />
      <PenguinCompanion />

      <Navbar name={config.personal.name} />

      <main className="relative z-10">
        <div id="hero">
          <Hero config={config} />
        </div>

        <div id="articles">
          <Articles
            articles={articles}
            tags={config.tags}
            onArticleClick={setSelectedArticle}
          />
        </div>

        <div id="projects">
          <Projects repos={repos} analyses={analyses} commits={commits} />
        </div>

        <Footer config={config} />
      </main>

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </>
  );
}
```

**Key changes:**
- Removed `loading` state and `LoadingScreen` import.
- Replaced `SporeCanvas` with `ParallaxDepth`.
- Removed `paper-grain` class from `<main>`.
- Everything else stays the same.

**Step 2: Verify**

```bash
docker compose exec dev npx tsc --noEmit
```

Visually: Full page should work — Hero with scroll-linked type, Articles as editorial spreads, Projects as horizontal scroll reel, Footer as cinematic closing.

**Step 3: Commit**

```bash
git add next-app/components/PageClient.tsx
git commit -m "feat: restructure PageClient with scene-based layout, replace SporeCanvas with ParallaxDepth"
```

---

### Task 12: Clean Up Dead Code

Delete files that are no longer imported anywhere.

**Files:**
- Delete: `components/SporeCanvas.tsx`
- Delete: `components/LoadingScreen.tsx`
- Delete: `components/ArticleCard.tsx`
- Delete: `components/ProjectCard.tsx`

**Step 1: Verify no remaining imports**

Search the codebase for imports of these files:
```bash
grep -r "SporeCanvas\|LoadingScreen\|ArticleCard\|ProjectCard" next-app/components/ next-app/app/ --include="*.tsx" --include="*.ts"
```

Expected: No results (if Tasks 4, 6, 11 were done correctly). If any remain, update those files first.

**Step 2: Delete files**

```bash
rm next-app/components/SporeCanvas.tsx
rm next-app/components/LoadingScreen.tsx
rm next-app/components/ArticleCard.tsx
rm next-app/components/ProjectCard.tsx
```

**Step 3: Verify build**

```bash
docker compose exec dev npx tsc --noEmit
```

Expected: No errors.

**Step 4: Commit**

```bash
git add -A next-app/components/
git commit -m "chore: delete SporeCanvas, LoadingScreen, ArticleCard, ProjectCard (replaced by new components)"
```

---

### Task 13: Docker Build Verification & Visual QA

Run the full production Docker build and visually verify all scenes.

**Step 1: Rebuild dev container**

```bash
docker compose up dev --build -d
```

Wait for it to be ready, then:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```
Expected: 200

**Step 2: Type check**

```bash
docker compose exec dev npx tsc --noEmit
```
Expected: No errors.

**Step 3: Visual checklist**

Open http://localhost:3000 in a browser and verify:

- [ ] **Hero:** Name fills screen in massive Fraunces. Scrolling expands letter spacing. Subtitle and social icons fade in. Everything exits upward.
- [ ] **Articles:** "Writing" heading reveals word-by-word. Tag filters stick below navbar. Articles appear as full-bleed editorial spreads with image parallax.
- [ ] **Projects:** Section title appears first. Horizontal scrolling through project frames driven by vertical scroll. Progress bar at bottom. Click to expand project details.
- [ ] **Footer:** Background fades to near-black. Name and social icons appear centered.
- [ ] **Navbar:** Transparent on hero, blur on scroll. Scroll progress bar at bottom of navbar.
- [ ] **Penguin:** Peeks from right during hero→articles, sits during projects, dances in footer. Hidden on mobile.
- [ ] **ParallaxDepth:** Subtle blurred circles move at different rates in background.
- [ ] **Dark mode:** Toggle works. All scenes maintain readability. Footer still fades to noir.
- [ ] **Mobile:** Hero text scales down. Articles stack vertically. Project frames are 85vw. Navbar hamburger works.
- [ ] **Article modal:** Click an article spread → modal opens with markdown content.

**Step 4: Fix any issues found**

Address visual bugs, spacing issues, or type errors.

**Step 5: Commit fixes**

```bash
git add -A next-app/
git commit -m "fix: visual QA polish and adjustments"
```

---

### Task 14: Update globals.css — Remove Stale Styles

Clean up CSS that was specific to the old layout.

**Files:**
- Modify: `app/globals.css`

**Step 1: Review and clean**

- The `.paper-grain` class is no longer used (PageClient removed it). Remove the `.paper-grain` and `.paper-grain::before` and `.dark .paper-grain::before` rules.
- The `.tag-base` class — check if still used. If not, remove it.
- Keep all color tokens, font variables, scrollbar styles, animations.

**Step 2: Verify build**

```bash
docker compose exec dev npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add next-app/app/globals.css
git commit -m "chore: remove stale paper-grain and unused CSS from globals"
```
