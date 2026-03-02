# Ceramic Studio UI Refresh — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the portfolio site from dark ember theme to warm organic "Ceramic Studio" aesthetic using the Claude Color Palette, with light/dark mode toggle.

**Architecture:** Replace the current dark-only ember theme with a dual-mode (light default + dark) system using next-themes and CSS variables. Swap typography from ClashDisplay/GeneralSans to Fraunces/Plus Jakarta Sans via next/font/google. Restructure layout from full-screen sections to flowing page with sticky nav. Reimagine canvas particles as organic spores.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui (new-york), next-themes, Framer Motion, next/font/google

---

## Task 1: Install Dependencies & shadcn Components

**Files:**
- Modify: `next-app/package.json`
- Modify: `next-app/components.json`

**Step 1: Install next-themes**

Run: `cd next-app && npm install next-themes`

**Step 2: Install shadcn components**

Run:
```bash
cd next-app
npx shadcn@latest add card dialog separator tabs scroll-area dropdown-menu navigation-menu toggle skeleton
```

**Step 3: Verify installation**

Run: `ls next-app/components/ui/`
Expected: New files for card.tsx, dialog.tsx, separator.tsx, tabs.tsx, scroll-area.tsx, dropdown-menu.tsx, navigation-menu.tsx, toggle.tsx, skeleton.tsx

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: install next-themes and shadcn components for Ceramic Studio redesign"
```

---

## Task 2: Replace Typography — Fraunces + Plus Jakarta Sans

**Files:**
- Modify: `next-app/app/fonts.ts`
- Modify: `next-app/app/layout.tsx`
- Modify: `next-app/app/globals.css` (font variables only)

**Step 1: Replace fonts.ts with Google Fonts**

Replace `next-app/app/fonts.ts` entirely:

```ts
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});
```

**Step 2: Update layout.tsx to use new fonts**

In `next-app/app/layout.tsx`, replace the import and className:

```tsx
import { fraunces, plusJakartaSans } from "./fonts";
```

Change the `<html>` tag className from:
```
${clashDisplay.variable} ${generalSans.variable}
```
to:
```
${fraunces.variable} ${plusJakartaSans.variable}
```

**Step 3: Update font variables in globals.css**

In the `@theme inline` block, replace the Typography section:

```css
/* Typography */
--font-display: var(--font-fraunces), Georgia, "Times New Roman", serif;
--font-sans: var(--font-plus-jakarta), ui-sans-serif, system-ui, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, monospace;
```

**Step 4: Verify build**

Run: `cd next-app && npx tsc --noEmit`
Expected: No errors (or only pre-existing ones)

**Step 5: Commit**

```bash
git add next-app/app/fonts.ts next-app/app/layout.tsx next-app/app/globals.css
git commit -m "feat: replace typography with Fraunces and Plus Jakarta Sans"
```

---

## Task 3: Implement Claude Color Palette + Light/Dark Theme System

**Files:**
- Rewrite: `next-app/app/globals.css`
- Modify: `next-app/app/layout.tsx` (wrap with ThemeProvider)

**Step 1: Create ThemeProvider component**

Create `next-app/components/ThemeProvider.tsx`:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```

**Step 2: Wrap layout.tsx with ThemeProvider**

In `next-app/app/layout.tsx`, import ThemeProvider and wrap `{children}`:

```tsx
import { ThemeProvider } from "@/components/ThemeProvider";
```

Body becomes:
```tsx
<body className="bg-background text-foreground font-sans antialiased">
  <ThemeProvider>{children}</ThemeProvider>
</body>
```

Remove `suppressHydrationWarning` if not present; add it to `<html>` tag:
```tsx
<html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${plusJakartaSans.variable}`}>
```

**Step 3: Rewrite globals.css with Claude palette**

Replace the entire `next-app/app/globals.css` with:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Claude Color Palette — Semantic tokens */
  --color-claude-white: #FFFFFF;
  --color-claude-cream: #FDF9F3;
  --color-claude-taupe: #D2C3B7;
  --color-claude-muted-brown: #7E6E5C;
  --color-claude-brown: #3F3227;
  --color-claude-rust: #D0643A;
  --color-claude-dark: #211A15;
  --color-claude-noir: #0E0A08;

  /* Typography */
  --font-display: var(--font-fraunces), Georgia, "Times New Roman", serif;
  --font-sans: var(--font-plus-jakarta), ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

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

  /* shadcn theme var bindings */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

/* Light mode (default) */
:root {
  --radius: 0.625rem;
  --background: #FFFFFF;
  --foreground: #3F3227;
  --card: #FDF9F3;
  --card-foreground: #3F3227;
  --popover: #FFFFFF;
  --popover-foreground: #3F3227;
  --primary: #D0643A;
  --primary-foreground: #FFFFFF;
  --secondary: #FDF9F3;
  --secondary-foreground: #3F3227;
  --muted: #FDF9F3;
  --muted-foreground: #7E6E5C;
  --accent: #FDF9F3;
  --accent-foreground: #3F3227;
  --destructive: #D0643A;
  --border: #D2C3B7;
  --input: #D2C3B7;
  --ring: #D0643A;
  --chart-1: #D0643A;
  --chart-2: #7E6E5C;
  --chart-3: #3F3227;
  --chart-4: #D2C3B7;
  --chart-5: #211A15;
  --sidebar: #FDF9F3;
  --sidebar-foreground: #3F3227;
  --sidebar-primary: #D0643A;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #FDF9F3;
  --sidebar-accent-foreground: #3F3227;
  --sidebar-border: #D2C3B7;
  --sidebar-ring: #D0643A;
}

/* Dark mode */
.dark {
  --background: #0E0A08;
  --foreground: #FDF9F3;
  --card: #211A15;
  --card-foreground: #FDF9F3;
  --popover: #211A15;
  --popover-foreground: #FDF9F3;
  --primary: #D0643A;
  --primary-foreground: #FDF9F3;
  --secondary: #3F3227;
  --secondary-foreground: #FDF9F3;
  --muted: #3F3227;
  --muted-foreground: #D2C3B7;
  --accent: #3F3227;
  --accent-foreground: #FDF9F3;
  --destructive: #D0643A;
  --border: #7E6E5C;
  --input: #7E6E5C;
  --ring: #D0643A;
  --chart-1: #D0643A;
  --chart-2: #D2C3B7;
  --chart-3: #FDF9F3;
  --chart-4: #7E6E5C;
  --chart-5: #3F3227;
  --sidebar: #211A15;
  --sidebar-foreground: #FDF9F3;
  --sidebar-primary: #D0643A;
  --sidebar-primary-foreground: #FDF9F3;
  --sidebar-accent: #3F3227;
  --sidebar-accent-foreground: #FDF9F3;
  --sidebar-border: #7E6E5C;
  --sidebar-ring: #D0643A;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--muted);
}
::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--foreground);
}

/* Paper grain texture overlay (light mode) */
.paper-grain {
  position: relative;
}
.paper-grain::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
}
.dark .paper-grain::before {
  opacity: 0.05;
}

/* Tag base styles */
.tag-base {
  @apply px-3 py-1 text-xs font-medium rounded-full border transition-colors;
}
```

**Step 4: Verify build compiles**

Run: `cd next-app && npx tsc --noEmit`

**Step 5: Commit**

```bash
git add next-app/app/globals.css next-app/app/layout.tsx next-app/components/ThemeProvider.tsx
git commit -m "feat: implement Claude color palette with light/dark theme system"
```

---

## Task 4: Build Sticky Navigation Bar + Theme Toggle

**Files:**
- Create: `next-app/components/Navbar.tsx`
- Create: `next-app/components/ThemeToggle.tsx`

**Step 1: Create ThemeToggle component**

Create `next-app/components/ThemeToggle.tsx`:

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Step 2: Create Navbar component**

Create `next-app/components/Navbar.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "About", href: "#hero" },
  { label: "Writing", href: "#articles" },
  { label: "Projects", href: "#projects" },
];

export function Navbar({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Name */}
        <button
          onClick={() => scrollTo("#hero")}
          className="font-display text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors"
        >
          {name}
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background/95 backdrop-blur-md border-b border-border px-6 pb-4"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="block w-full text-left py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
        </motion.div>
      )}
    </motion.header>
  );
}
```

**Step 3: Verify build**

Run: `cd next-app && npx tsc --noEmit`

**Step 4: Commit**

```bash
git add next-app/components/Navbar.tsx next-app/components/ThemeToggle.tsx
git commit -m "feat: add sticky Navbar with theme toggle"
```

---

## Task 5: Redesign Hero Section

**Files:**
- Rewrite: `next-app/components/Hero.tsx`

**Step 1: Rewrite Hero with Fraunces serif, clean layout**

Rewrite `next-app/components/Hero.tsx`:

```tsx
"use client";

import { motion } from "motion/react";
import { Mail, Linkedin, Github } from "lucide-react";
import { Config } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

export function Hero({ config }: { config: Config }) {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <motion.h1
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="font-display text-[clamp(3rem,10vw,7rem)] font-black leading-[0.95] tracking-tight text-foreground"
      >
        {config.personal.name}
      </motion.h1>

      <motion.p
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mt-4 text-lg md:text-xl text-muted-foreground font-sans"
      >
        Software Engineer
      </motion.p>

      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex items-center gap-4 mt-8"
      >
        <a
          href={`mailto:${config.social.email}`}
          aria-label="Email"
          className="p-3 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        >
          <Mail className="w-5 h-5" />
        </a>
        <a
          href={config.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="p-3 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        >
          <Linkedin className="w-5 h-5" />
        </a>
        <a
          href={config.social.github.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="p-3 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        >
          <Github className="w-5 h-5" />
        </a>
      </motion.div>

      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="absolute bottom-10"
      >
        <button
          onClick={() =>
            document.querySelector("#articles")?.scrollIntoView({ behavior: "smooth" })
          }
          aria-label="Scroll down"
          className="text-muted-foreground hover:text-foreground transition-colors animate-float"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </motion.div>
    </section>
  );
}
```

**Step 2: Verify build**

Run: `cd next-app && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add next-app/components/Hero.tsx
git commit -m "feat: redesign Hero section with Ceramic Studio aesthetic"
```

---

## Task 6: Redesign Article Cards + Articles Section (Masonry Grid)

**Files:**
- Rewrite: `next-app/components/Articles.tsx`
- Rewrite: `next-app/components/ArticleCard.tsx`

**Step 1: Rewrite ArticleCard using shadcn card**

Rewrite `next-app/components/ArticleCard.tsx`:

```tsx
"use client";

import { motion } from "motion/react";
import { Article, TagDefinition } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface ArticleCardProps {
  article: Article;
  tags: Record<string, TagDefinition>;
  onClick: () => void;
  featured?: boolean;
}

export function ArticleCard({ article, tags, onClick, featured }: ArticleCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={onClick}
        className="group cursor-pointer overflow-hidden border-border hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      >
        {article.image && (
          <div className={`relative overflow-hidden ${featured ? "h-64" : "h-44"}`}>
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              style={article.imagePosition ? { objectPosition: article.imagePosition } : undefined}
            />
          </div>
        )}
        <CardContent className="p-5">
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {article.summary}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

**Step 2: Rewrite Articles section with masonry-style grid**

Rewrite `next-app/components/Articles.tsx`:

```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Article, TagDefinition } from "@/types";
import { ArticleCard } from "./ArticleCard";
import { Toggle } from "@/components/ui/toggle";

interface ArticlesProps {
  articles: Article[];
  tags: Record<string, TagDefinition>;
  onArticleClick: (article: Article) => void;
}

export function Articles({ articles, tags, onArticleClick }: ArticlesProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? articles.filter((a) => a.tags.includes(activeTag))
    : articles;

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
      >
        Writing
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground mb-8 max-w-lg"
      >
        Thoughts on software engineering, security, and building things.
      </motion.p>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2 mb-10">
        <Toggle
          pressed={activeTag === null}
          onPressedChange={() => setActiveTag(null)}
          className="rounded-full text-xs"
          size="sm"
        >
          All
        </Toggle>
        {Object.entries(tags).map(([key, tag]) => (
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

      {/* Masonry-style grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((article, i) => (
            <div key={article.slug} className="break-inside-avoid">
              <ArticleCard
                article={article}
                tags={tags}
                onClick={() => onArticleClick(article)}
                featured={i === 0 && !activeTag}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
```

**Step 3: Verify build**

Run: `cd next-app && npx tsc --noEmit`

**Step 4: Commit**

```bash
git add next-app/components/Articles.tsx next-app/components/ArticleCard.tsx
git commit -m "feat: redesign Articles section with masonry grid and shadcn cards"
```

---

## Task 7: Redesign Projects Section (Card Grid + Inline Expand)

**Files:**
- Rewrite: `next-app/components/Projects.tsx`
- Rewrite: `next-app/components/ProjectCard.tsx`
- Modify: `next-app/components/ProjectDetail.tsx`

**Step 1: Rewrite ProjectCard using shadcn card**

Rewrite `next-app/components/ProjectCard.tsx`:

```tsx
"use client";

import { Star } from "lucide-react";
import { GitHubRepo } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

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

interface ProjectCardProps {
  repo: GitHubRepo;
  selected: boolean;
  onClick: () => void;
}

export function ProjectCard({ repo, selected, onClick }: ProjectCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
        selected
          ? "border-l-4 border-l-primary border-t-border border-r-border border-b-border shadow-md"
          : "border-border hover:border-primary/40"
      }`}
    >
      <CardContent className="p-5">
        <h3 className="font-display text-base font-bold text-foreground">
          {repo.name}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {repo.description}
        </p>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: LANG_COLORS[repo.language] || "#7E6E5C" }}
              />
              {repo.language}
            </span>
          )}
          {repo.stargazers_count > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {repo.stargazers_count}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Rewrite Projects section with grid + inline expand**

Rewrite `next-app/components/Projects.tsx`:

```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GitHubRepo, ProjectAnalysis, GitHubCommit } from "@/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectDetail } from "./ProjectDetail";
import { Separator } from "@/components/ui/separator";

interface ProjectsProps {
  repos: GitHubRepo[];
  analyses: Record<string, ProjectAnalysis>;
  commits: Record<string, GitHubCommit[]>;
}

export function Projects({ repos, analyses, commits }: ProjectsProps) {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);

  const handleSelect = (repo: GitHubRepo) => {
    setSelectedRepo(selectedRepo?.name === repo.name ? null : repo);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
      >
        Projects
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground mb-10 max-w-lg"
      >
        Open source work and side projects.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repos.map((repo) => (
          <ProjectCard
            key={repo.name}
            repo={repo}
            selected={selectedRepo?.name === repo.name}
            onClick={() => handleSelect(repo)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedRepo && (
          <motion.div
            key={selectedRepo.name}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Separator className="my-6" />
            <ProjectDetail
              repo={selectedRepo}
              analysis={analyses[selectedRepo.name]}
              commits={commits[selectedRepo.name] || []}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
```

**Step 3: Update ProjectDetail theming**

In `next-app/components/ProjectDetail.tsx`, update color references:
- Replace any `ember` / `surface-*` / `text-primary` color classes with their shadcn equivalents (`foreground`, `muted-foreground`, `card`, `border`, `primary`)
- This is a targeted find-and-replace within the file. Key substitutions:
  - `text-text-primary` → `text-foreground`
  - `text-text-secondary` → `text-muted-foreground`
  - `bg-surface-1` / `bg-surface-2` → `bg-card`
  - `border-surface-3` → `border-border`
  - `text-ember` → `text-primary`

**Step 4: Verify build**

Run: `cd next-app && npx tsc --noEmit`

**Step 5: Commit**

```bash
git add next-app/components/Projects.tsx next-app/components/ProjectCard.tsx next-app/components/ProjectDetail.tsx
git commit -m "feat: redesign Projects section with card grid and inline expansion"
```

---

## Task 8: Redesign Article Modal (shadcn Dialog)

**Files:**
- Rewrite: `next-app/components/ArticleModal.tsx`

**Step 1: Rewrite ArticleModal using shadcn dialog + scroll-area**

Rewrite `next-app/components/ArticleModal.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Article } from "@/types";
import { Mermaid } from "./Mermaid";

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
}

export function ArticleModal({ article, onClose }: ArticleModalProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(article.markdownPath)
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      });
  }, [article.markdownPath]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Hero image */}
        {article.image && (
          <div className="relative h-56 w-full overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              style={article.imagePosition ? { objectPosition: article.imagePosition } : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}

        <ScrollArea className="flex-1 px-8 pb-8">
          {/* Title area */}
          <div className={article.image ? "-mt-12 relative z-10" : "pt-8"}>
            <DialogTitle className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {article.title}
            </DialogTitle>
            <div className="flex flex-wrap gap-2 mt-4 mb-8">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Markdown content */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          ) : (
            <article className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-display prose-headings:font-bold
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-card prose-pre:border prose-pre:border-border
              prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
              prose-img:rounded-lg
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  pre({ children, ...props }) {
                    const codeEl = children as React.ReactElement;
                    if (codeEl?.props?.className?.includes("language-mermaid")) {
                      return <Mermaid chart={codeEl.props.children as string} />;
                    }
                    return <pre {...props}>{children}</pre>;
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Verify build**

Run: `cd next-app && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add next-app/components/ArticleModal.tsx
git commit -m "feat: redesign ArticleModal with shadcn Dialog and ScrollArea"
```

---

## Task 9: Redesign Footer + Remove DotNav/SceneContainer

**Files:**
- Rewrite: `next-app/components/Footer.tsx`
- Delete or empty: `next-app/components/DotNav.tsx` (after removing usage)
- Delete or empty: `next-app/components/SceneContainer.tsx` (after removing usage)

**Step 1: Rewrite Footer**

Rewrite `next-app/components/Footer.tsx`:

```tsx
import { Mail, Linkedin, Github } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Config } from "@/types";

export function Footer({ config }: { config: Config }) {
  return (
    <footer className="max-w-6xl mx-auto px-6 pb-12">
      <Separator className="mb-8" />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} {config.personal.name}</span>
        <div className="flex items-center gap-4">
          <a
            href={`mailto:${config.social.email}`}
            aria-label="Email"
            className="hover:text-foreground transition-colors"
          >
            <Mail className="w-4 h-4" />
          </a>
          <a
            href={config.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-foreground transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href={config.social.github.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
```

**Step 2: Commit**

```bash
git add next-app/components/Footer.tsx
git commit -m "feat: redesign Footer with Separator and minimal layout"
```

---

## Task 10: Redesign PageClient (New Layout Structure)

**Files:**
- Rewrite: `next-app/components/PageClient.tsx`

**Step 1: Rewrite PageClient with new structure**

Remove DotNav, SceneContainer wrappers. Add Navbar. Keep SporeCanvas and PenguinCompanion.

```tsx
"use client";

import { useState } from "react";
import { Config, Article, GitHubRepo, ProjectAnalysis, GitHubCommit } from "@/types";
import { SporeCanvas } from "./SporeCanvas";
import { LoadingScreen } from "./LoadingScreen";
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
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      <SporeCanvas className="fixed inset-0 z-0 pointer-events-none" />
      <PenguinCompanion />

      <Navbar name={config.personal.name} />

      <main className="relative z-10 paper-grain">
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

**Step 2: Verify build**

Run: `cd next-app && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add next-app/components/PageClient.tsx
git commit -m "feat: restructure PageClient with Navbar, remove DotNav/SceneContainer"
```

---

## Task 11: Reimagine EmberCanvas → SporeCanvas

**Files:**
- Create: `next-app/components/SporeCanvas.tsx` (based on EmberCanvas.tsx)

**Step 1: Create SporeCanvas with organic floating particles**

Create `next-app/components/SporeCanvas.tsx`. Base it on the EmberCanvas structure but change:
- Colors: Use Claude palette (Pale Taupe #D2C3B7, Muted Brown #7E6E5C, Cream #FDF9F3) — detect dark mode to pick appropriate set
- Movement: Slow upward drift with gentle lateral sway (sine wave), not fast embers
- Shape: Larger, softer circles with more blur (radial gradient with wider falloff)
- Count: 30-50 particles (reduced from 50-120)
- Mouse interaction: Softer repulsion (larger radius, gentler force)
- Opacity: 0.1-0.3 (light mode), 0.15-0.4 (dark mode)

```tsx
"use client";

import { useRef, useEffect } from "react";

interface Spore {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  phase: number;
}

const LIGHT_COLORS = ["#D2C3B7", "#7E6E5C", "#3F3227"];
const DARK_COLORS = ["#FDF9F3", "#D2C3B7", "#7E6E5C"];

export function SporeCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sporesRef = useRef<Spore[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();

    const isDark = () => document.documentElement.classList.contains("dark");
    const count = window.innerWidth < 768 ? 25 : 40;
    const colors = isDark() ? DARK_COLORS : LIGHT_COLORS;

    const createSpore = (): Spore => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -(Math.random() * 0.4 + 0.1),
      opacity: Math.random() * 0.2 + 0.08,
      color: colors[Math.floor(Math.random() * colors.length)],
      phase: Math.random() * Math.PI * 2,
    });

    sporesRef.current = Array.from({ length: count }, createSpore);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("resize", resize, { passive: true });

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      time += 0.01;

      const currentColors = isDark() ? DARK_COLORS : LIGHT_COLORS;

      for (const s of sporesRef.current) {
        // Lateral sway
        s.x += s.speedX + Math.sin(time + s.phase) * 0.15;
        s.y += s.speedY;

        // Mouse repulsion (gentle)
        const dx = s.x - mouseRef.current.x;
        const dy = s.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150 * 0.5;
          s.x += (dx / dist) * force;
          s.y += (dy / dist) * force;
        }

        // Wrap around
        if (s.y < -10) {
          s.y = window.innerHeight + 10;
          s.x = Math.random() * window.innerWidth;
        }
        if (s.x < -10) s.x = window.innerWidth + 10;
        if (s.x > window.innerWidth + 10) s.x = -10;

        // Update color if theme changed
        if (!currentColors.includes(s.color)) {
          s.color = currentColors[Math.floor(Math.random() * currentColors.length)];
        }

        // Draw spore
        const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
        gradient.addColorStop(0, s.color);
        gradient.addColorStop(1, "transparent");
        ctx.globalAlpha = s.opacity;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
```

**Step 2: Verify build**

Run: `cd next-app && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add next-app/components/SporeCanvas.tsx
git commit -m "feat: add SporeCanvas with organic floating particles"
```

---

## Task 12: Restyle Penguin Companion with Claude Palette

**Files:**
- Modify: `next-app/components/penguin/sprites.ts`

**Step 1: Update penguin sprite colors**

In `next-app/components/penguin/sprites.ts`, update the color constants used for rendering:
- Body/dark color: Change from black/dark to Claude Brown `#3F3227`
- Belly/light color: Change from white to Cream `#FDF9F3`
- Beak/feet color: Change from orange/yellow to Rust `#D0643A`
- Eye color: Keep as-is or use Deep Noir `#0E0A08`

This is a targeted color value replacement in the sprite definitions. Search for hex color constants and swap them.

**Step 2: Verify visually**

Run: `cd next-app && npm run dev`
Check the penguin renders with warm brown/cream/rust colors.

**Step 3: Commit**

```bash
git add next-app/components/penguin/sprites.ts
git commit -m "feat: restyle penguin companion with Claude palette colors"
```

---

## Task 13: Redesign LoadingScreen

**Files:**
- Rewrite: `next-app/components/LoadingScreen.tsx`

**Step 1: Replace particle "DSB" animation with warm pulse loader**

Simplify the loading screen to a centered warm pulse using the Claude palette:

```tsx
"use client";

import { motion } from "motion/react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-border border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="font-display text-sm text-muted-foreground tracking-widest uppercase">
          Loading
        </span>
      </motion.div>
    </motion.div>
  );
}
```

**Step 2: Verify build**

Run: `cd next-app && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add next-app/components/LoadingScreen.tsx
git commit -m "feat: simplify LoadingScreen with warm spinner"
```

---

## Task 14: Update AI Element Components Theming

**Files:**
- Modify: `next-app/components/ai-elements/commit.tsx`
- Modify: `next-app/components/ai-elements/package-info.tsx`

**Step 1: Find and replace ember/surface color classes in commit.tsx**

Targeted replacements:
- `text-text-primary` → `text-foreground`
- `text-text-secondary` → `text-muted-foreground`
- `text-text-muted` → `text-muted-foreground`
- `bg-surface-1` / `bg-surface-2` → `bg-card`
- `border-surface-3` → `border-border`
- `text-ember` → `text-primary`
- `bg-ember` → `bg-primary`
- `hover:text-ember` → `hover:text-primary`

**Step 2: Same replacements in package-info.tsx**

Apply identical color class substitutions.

**Step 3: Verify build**

Run: `cd next-app && npx tsc --noEmit`

**Step 4: Commit**

```bash
git add next-app/components/ai-elements/
git commit -m "feat: update AI element components to use shadcn theme tokens"
```

---

## Task 15: Update Mermaid Component Theming

**Files:**
- Modify: `next-app/components/Mermaid.tsx`

**Step 1: Update Mermaid theme colors**

Replace ember-themed colors in the Mermaid configuration with Claude palette equivalents:
- Primary color: Rust `#D0643A`
- Background: use CSS var for background
- Text: use CSS var for foreground
- Line color: Muted Brown `#7E6E5C`

**Step 2: Commit**

```bash
git add next-app/components/Mermaid.tsx
git commit -m "feat: update Mermaid diagram theming to Claude palette"
```

---

## Task 16: Clean Up Dead Code

**Files:**
- Remove unused: `next-app/components/EmberCanvas.tsx` (replaced by SporeCanvas)
- Remove unused: `next-app/components/DotNav.tsx` (replaced by Navbar)
- Remove unused: `next-app/components/SceneContainer.tsx` (no longer used)
- Remove unused: `next-app/app/fonts/` directory (local font files no longer needed)

**Step 1: Delete unused files**

```bash
rm next-app/components/EmberCanvas.tsx
rm next-app/components/DotNav.tsx
rm next-app/components/SceneContainer.tsx
rm -rf next-app/app/fonts/
```

**Step 2: Verify no remaining imports reference deleted files**

Run: `cd next-app && npx tsc --noEmit`
If errors found, fix remaining imports.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove EmberCanvas, DotNav, SceneContainer, and local font files"
```

---

## Task 17: Visual QA and Polish

**Files:** Various — based on what needs fixing

**Step 1: Run dev server and verify all pages**

Run: `cd next-app && npm run dev`

Check:
- [ ] Light mode default loads correctly
- [ ] Dark mode toggle works
- [ ] Fraunces displays for headings
- [ ] Plus Jakarta Sans displays for body
- [ ] Hero section centered, social links work
- [ ] Navbar scrolls with backdrop blur
- [ ] Articles masonry grid renders
- [ ] Tag filtering works
- [ ] Article modal opens/closes
- [ ] Projects card grid renders
- [ ] Project detail expands inline
- [ ] SporeCanvas particles visible and subtle
- [ ] Penguin companion renders with new colors
- [ ] Footer renders cleanly
- [ ] Mobile responsive (hamburger nav, single column)
- [ ] Loading screen shows and dismisses

**Step 2: Fix any visual issues found**

Address spacing, color, font, or layout bugs.

**Step 3: Run production build**

Run: `cd next-app && npm run build`
Expected: Builds successfully

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix: visual QA polish and responsive fixes"
```
