# Ember Canvas Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Nuclear rebuild of the portfolio website from Vite + React to Next.js 15 with warm ember aesthetic, interactive particles, and AI-powered generative UI for projects.

**Architecture:** Next.js 15 App Router with standalone output for Docker. Client components for interactive elements (particles, animations, AI chat). Server-side API routes for GitHub proxy and AI SDK streaming. Static assets (config, articles, images, markdown) served from `/public/`.

**Tech Stack:** Next.js 15, Tailwind CSS v4, Motion (framer-motion successor), Vercel AI SDK + OpenAI, AI Elements, Clash Display + General Sans fonts, Docker standalone, GitHub Actions CI/CD.

**Design doc:** `docs/plans/2026-02-25-ember-canvas-ui-refresh-design.md`

---

## Task 1: Scaffold Next.js Project

Create the new Next.js app alongside the existing `react-app/` directory. We'll build in a new `next-app/` folder.

**Files:**
- Create: `next-app/` (via create-next-app)
- Modify: root `Dockerfile`, `docker-compose.yaml`, `.github/workflows/deploy.yaml` (later tasks)

**Step 1: Create Next.js app**

```bash
cd /Users/danielbrandao/Documents/proxmox/websitev2
npx create-next-app@latest next-app --yes
```

This scaffolds with TypeScript, Tailwind, ESLint, App Router, Turbopack.

**Step 2: Install all dependencies**

```bash
cd next-app
npm install motion ai @ai-sdk/react @ai-sdk/openai zod react-markdown remark-gfm rehype-highlight rehype-raw
```

**Step 3: Install shadcn/ui + AI Elements**

```bash
cd next-app
npx shadcn@latest init -d
npx shadcn@latest add https://elements.ai-sdk.dev/api/registry/package-info.json
npx shadcn@latest add https://elements.ai-sdk.dev/api/registry/code-block.json
npx shadcn@latest add https://elements.ai-sdk.dev/api/registry/file-tree.json
npx shadcn@latest add https://elements.ai-sdk.dev/api/registry/snippet.json
```

**Step 4: Configure Next.js for standalone output**

Modify `next-app/next.config.ts`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // Static images from /public
  },
}

export default nextConfig
```

**Step 5: Verify dev server starts**

```bash
cd next-app && npm run dev
```

Visit http://localhost:3000 — should see default Next.js page.

**Step 6: Commit**

```bash
git add next-app/
git commit -m "feat: scaffold Next.js 15 app with AI SDK and Motion dependencies"
```

---

## Task 2: Migrate Static Assets

Copy all data files and images from `react-app/public/` to `next-app/public/`.

**Files:**
- Copy: `react-app/public/config/` → `next-app/public/config/`
- Copy: `react-app/public/blog-posts/` → `next-app/public/blog-posts/`
- Copy: `react-app/public/images/` → `next-app/public/images/`

**Step 1: Copy assets**

```bash
cp -r react-app/public/config next-app/public/
cp -r react-app/public/blog-posts next-app/public/
cp -r react-app/public/images next-app/public/
```

**Step 2: Verify files accessible**

With dev server running, visit:
- http://localhost:3000/config/config.json
- http://localhost:3000/config/articles.json

Both should return JSON content.

**Step 3: Commit**

```bash
git add next-app/public/
git commit -m "feat: migrate static assets (config, articles, images, blog posts)"
```

---

## Task 3: Set Up Theme System (Tailwind v4 + Fonts)

Configure the complete color system, typography, and font loading.

**Files:**
- Modify: `next-app/app/globals.css`
- Create: `next-app/app/fonts.ts`
- Modify: `next-app/app/layout.tsx`
- Modify: `next-app/postcss.config.mjs`

**Step 1: Download fonts from Fontshare**

Download Clash Display and General Sans variable font WOFF2 files from fontshare.com. Place in `next-app/app/fonts/`:

```
next-app/app/fonts/
├── ClashDisplay-Variable.woff2
└── GeneralSans-Variable.woff2
```

If variable fonts aren't available, download individual weight files (400, 500, 600, 700).

**Step 2: Create font configuration**

Create `next-app/app/fonts.ts`:

```ts
import localFont from 'next/font/local'

export const clashDisplay = localFont({
  src: './fonts/ClashDisplay-Variable.woff2',
  variable: '--font-clash-display',
  display: 'swap',
})

export const generalSans = localFont({
  src: './fonts/GeneralSans-Variable.woff2',
  variable: '--font-general-sans',
  display: 'swap',
})
```

**Step 3: Update PostCSS config for Tailwind v4**

Modify `next-app/postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
export default config
```

Also run: `npm install tailwindcss @tailwindcss/postcss postcss` (to ensure v4).

**Step 4: Set up globals.css with Ember Canvas theme**

Replace `next-app/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  /* Ember Canvas Color Palette */
  --color-bg: #0c0a09;
  --color-surface-1: #1c1917;
  --color-surface-2: #292524;
  --color-surface-3: #44403c;

  --color-ember: #f97316;
  --color-ember-glow: #fb923c;
  --color-ember-hot: #ea580c;
  --color-amber: #f59e0b;
  --color-coral: #f43f5e;

  --color-text-primary: #fafaf9;
  --color-text-secondary: #a8a29e;
  --color-text-muted: #78716c;

  /* Typography */
  --font-display: var(--font-clash-display), ui-sans-serif, system-ui, sans-serif;
  --font-sans: var(--font-general-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Animations */
  --animate-float: float 6s ease-in-out infinite;
  --animate-glow: glow 2s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
    50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.6); }
  }
}

/* Base styles */
body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--color-surface-1);
}
::-webkit-scrollbar-thumb {
  background: var(--color-ember);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-ember-glow);
}

/* Gradient text utility */
.gradient-text {
  background: linear-gradient(135deg, #f97316, #f59e0b, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Tag base styles */
.tag-base {
  @apply px-3 py-1 text-xs font-medium rounded-full border transition-colors;
}
```

**Step 5: Update root layout**

Modify `next-app/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { clashDisplay, generalSans } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Daniel Brandao',
  description: 'Software Engineer | Backend Developer | AI Technologies',
  themeColor: '#0c0a09',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${clashDisplay.variable} ${generalSans.variable}`}>
      <body className="bg-bg text-text-primary font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

**Step 6: Verify theme works**

Create a temporary test in `next-app/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div>
        <h1 className="font-display text-6xl font-bold gradient-text">
          Daniel Brandao
        </h1>
        <p className="text-text-secondary mt-4 text-lg">
          Theme test — warm ember palette
        </p>
        <div className="flex gap-3 mt-6">
          <div className="w-12 h-12 rounded bg-ember" />
          <div className="w-12 h-12 rounded bg-ember-glow" />
          <div className="w-12 h-12 rounded bg-amber" />
          <div className="w-12 h-12 rounded bg-coral" />
        </div>
      </div>
    </div>
  )
}
```

Run `npm run dev` and verify: warm black background, gradient text renders with orange tones, color swatches visible, Clash Display font loads.

**Step 7: Commit**

```bash
git add next-app/
git commit -m "feat: configure Ember Canvas theme with Tailwind v4, fonts, and color system"
```

---

## Task 4: Type Definitions and Data Hooks

Port the TypeScript types and create data-fetching utilities for Next.js.

**Files:**
- Create: `next-app/src/types/index.ts`
- Create: `next-app/src/lib/data.ts`

**Step 1: Create types**

Create `next-app/src/types/index.ts`:

```ts
export interface Config {
  personal: {
    name: string
    title: string
    college: { name: string; url: string }
    favoriteRestaurant: { name: string; url: string }
  }
  social: {
    github: { username: string; url: string }
    email: string
    linkedin: string
  }
  tags: Record<string, { color: string; description: string }>
  featured?: FeaturedItem[]
}

export interface FeaturedItem {
  title: string
  source: string
  url: string
}

export interface Article {
  title: string
  summary: string
  markdown: string
  image: string
  objectPosition?: string
  tags: string[]
}

export interface GitHubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
}
```

**Step 2: Create data-fetching utilities**

Create `next-app/src/lib/data.ts`:

```ts
import { Config, Article, GitHubRepo } from '@/types'
import fs from 'fs'
import path from 'path'

export async function getConfig(): Promise<Config> {
  const filePath = path.join(process.cwd(), 'public', 'config', 'config.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
}

export async function getArticles(): Promise<Article[]> {
  const filePath = path.join(process.cwd(), 'public', 'config', 'articles.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
}

export async function getGitHubRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=10&direction=desc`,
      {
        headers: { Accept: 'application/vnd.github.v3+json' },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )
    if (!res.ok) throw new Error('GitHub API failed')
    return res.json()
  } catch {
    // Fallback to local projects.json
    try {
      const filePath = path.join(process.cwd(), 'public', 'config', 'projects.json')
      const raw = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(raw)
    } catch {
      return []
    }
  }
}
```

**Step 3: Commit**

```bash
git add next-app/src/
git commit -m "feat: add TypeScript types and server-side data fetching utilities"
```

---

## Task 5: Ember Particle Background

Create the persistent canvas-based particle system that runs behind all content.

**Files:**
- Create: `next-app/src/components/EmberCanvas.tsx`

**Step 1: Build the ember particle canvas component**

Create `next-app/src/components/EmberCanvas.tsx`:

This is a `'use client'` component using `useRef`, `useEffect`, and `useCallback` for the canvas animation loop. Key behaviors:

- Canvas fills viewport, fixed position, z-index 0
- ~120 particles on desktop, ~50 on mobile (detect via `window.innerWidth`)
- Each particle: x, y, vx, vy (upward drift), size (1-4px), opacity (0.2-0.8), color (random from ember palette)
- Colors: `['#f97316', '#fb923c', '#ea580c', '#f59e0b', '#f43f5e']`
- Particles drift upward slowly (vy: -0.2 to -0.8), slight horizontal sway (sine wave)
- When particle goes off top, reset to bottom with random x
- Mouse interaction: particles within 100px of cursor get gentle push away
- Render: each particle drawn as a radial gradient circle (glow effect)
- `requestAnimationFrame` loop, cleanup on unmount
- `ResizeObserver` or window resize listener to update canvas dimensions
- Accept `className` prop for additional styling

The component should be approximately 120-180 lines of focused canvas code.

**Step 2: Verify particle rendering**

Add to `next-app/app/page.tsx` temporarily:

```tsx
import { EmberCanvas } from '@/components/EmberCanvas'

export default function Home() {
  return (
    <>
      <EmberCanvas className="fixed inset-0 z-0" />
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <h1 className="font-display text-6xl font-bold gradient-text">
          Ember Canvas
        </h1>
      </div>
    </>
  )
}
```

Run dev server. Verify: ember particles drift upward on dark background, mouse interaction works, text visible above particles.

**Step 3: Commit**

```bash
git add next-app/src/components/EmberCanvas.tsx
git commit -m "feat: add interactive ember particle canvas background"
```

---

## Task 6: Loading Screen

Create the intro animation where "DSB" forms from ember particles and dissolves.

**Files:**
- Create: `next-app/src/components/LoadingScreen.tsx`

**Step 1: Build loading screen**

Create `next-app/src/components/LoadingScreen.tsx`:

`'use client'` component with a full-screen canvas. Phases:

1. **Forming (1.2s)**: Particles spawn at random positions and converge to form "DSB" letterforms. Use predefined target positions for each letter (sampled from text path or grid-based letter shapes).
2. **Holding (1.5s)**: Particles hold position with subtle wave oscillation.
3. **Dissolving (1.0s)**: Particles burst outward with gravity, shrink, and fade. Canvas opacity transitions to 0.

Props:
- `onComplete: () => void` — called when animation finishes
- Colors: same ember palette as EmberCanvas

The component manages its own animation state via `useState` for the phase and `useEffect` for the canvas loop. When dissolving completes, calls `onComplete` and the parent removes it from DOM.

**Step 2: Integrate with page**

Wire into `app/page.tsx` with a state variable `loading` that starts `true` and flips to `false` on `onComplete`. Show `<LoadingScreen>` when loading, fade in main content when not.

**Step 3: Commit**

```bash
git add next-app/src/components/LoadingScreen.tsx
git commit -m "feat: add DSB ember particle loading screen animation"
```

---

## Task 7: Scene Layout and Navigation

Create the full-page scroll scene structure and floating dot navigation.

**Files:**
- Create: `next-app/src/components/SceneContainer.tsx`
- Create: `next-app/src/components/DotNav.tsx`
- Modify: `next-app/app/page.tsx`

**Step 1: Create SceneContainer**

Create `next-app/src/components/SceneContainer.tsx`:

`'use client'` component that wraps each scene section with:
- `min-h-screen` or `h-screen` as specified
- An `id` prop for scroll-to-section navigation
- Framer Motion `whileInView` entrance animation (fade up)
- `ref` forwarding for intersection observer

```tsx
'use client'

import { motion } from 'motion/react'
import { ReactNode } from 'react'

interface SceneContainerProps {
  id: string
  children: ReactNode
  className?: string
  minHeight?: boolean // true = min-h-screen, false = h-screen
}

export function SceneContainer({ id, children, className = '', minHeight = false }: SceneContainerProps) {
  return (
    <motion.section
      id={id}
      className={`${minHeight ? 'min-h-screen' : 'h-screen'} relative ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.section>
  )
}
```

**Step 2: Create DotNav**

Create `next-app/src/components/DotNav.tsx`:

`'use client'` component. Fixed position on right edge. Uses `IntersectionObserver` to track which scene is currently in view. Renders dots for each scene. Click scrolls to that section via `scrollIntoView({ behavior: 'smooth' })`. Active dot uses ember color, others are muted. Scene labels appear on hover (tooltip-style).

Scenes: `['hero', 'articles', 'projects']`

**Step 3: Wire up page.tsx**

Modify `next-app/app/page.tsx` to be the main orchestrator:

```tsx
import { getConfig, getArticles, getGitHubRepos } from '@/lib/data'
import { PageClient } from '@/components/PageClient'

export default async function Home() {
  const config = await getConfig()
  const articles = await getArticles()
  const repos = await getGitHubRepos(config.social.github.username)

  return <PageClient config={config} articles={articles} repos={repos} />
}
```

Create `next-app/src/components/PageClient.tsx` as the client-side orchestrator wrapping loading screen, ember canvas, scenes, and dot nav.

**Step 4: Commit**

```bash
git add next-app/src/components/ next-app/app/page.tsx
git commit -m "feat: add scene layout system with scroll-triggered animations and dot navigation"
```

---

## Task 8: Hero Section

Build the full-viewport hero with oversized name and social links.

**Files:**
- Create: `next-app/src/components/Hero.tsx`

**Step 1: Build hero component**

Create `next-app/src/components/Hero.tsx`:

`'use client'` component. Props: `config: Config`.

Layout:
- Full viewport height, flex centered
- Name in oversized Clash Display: `text-[clamp(3rem,10vw,10rem)]` with `.gradient-text`
- "Software Engineer" subtitle in General Sans, `text-text-secondary`
- Bio paragraph from config data
- Social links row: Email, LinkedIn, GitHub as icon buttons
- Scroll indicator at bottom: animated chevron bouncing downward

Use Framer Motion `stagger` for children entrance: name → subtitle → bio → social links appear sequentially with 0.1s delay between each.

Icons: Use simple SVG inline icons or install `lucide-react`:

```bash
cd next-app && npm install lucide-react
```

**Step 2: Verify hero rendering**

Check that name renders large with gradient, bio text is readable, social icons link correctly, scroll indicator animates.

**Step 3: Commit**

```bash
git add next-app/src/components/Hero.tsx
git commit -m "feat: add hero section with oversized typography and staggered entrance"
```

---

## Task 9: Articles Section — Bento Grid

Build the articles section with bento/masonry grid and tag filtering.

**Files:**
- Create: `next-app/src/components/Articles.tsx`
- Create: `next-app/src/components/ArticleCard.tsx`

**Step 1: Build ArticleCard**

Create `next-app/src/components/ArticleCard.tsx`:

`'use client'` component. Props: `article: Article`, `featured?: boolean`, `onClick: () => void`.

- Card with `bg-surface-1` background, rounded corners, overflow hidden
- Image at top with `object-cover`, uses `article.image` and `article.objectPosition`
- Featured cards get larger image height (h-56 vs h-40)
- Title in Clash Display 600
- Summary truncated to 2 lines
- Tag pills at bottom using tag color system
- **3D tilt on hover**: CSS `perspective` + `transform: rotateX/rotateY` driven by mouse position on card. Use `onMouseMove` to calculate tilt angle (max ±5deg). Reset on mouse leave.
- Framer Motion `whileHover` for subtle scale (1.02)

**Step 2: Build Articles container**

Create `next-app/src/components/Articles.tsx`:

`'use client'` component. Props: `articles: Article[]`, `tags: Config['tags']`.

- Section header: "Writing" in Clash Display
- Filter tags row: "All" + each tag from config. Active tag highlighted in ember. Click filters articles.
- Bento grid: CSS Grid with `grid-template-columns` varying by breakpoint
  - Desktop: 3 columns, featured article spans 2
  - Tablet: 2 columns
  - Mobile: 1 column
- Articles filtered by selected tag, with staggered Framer Motion entrance
- Click on card opens article modal (handled by parent via callback)

**Step 3: Commit**

```bash
git add next-app/src/components/Articles.tsx next-app/src/components/ArticleCard.tsx
git commit -m "feat: add articles bento grid with tag filtering and 3D card tilt"
```

---

## Task 10: Article Modal (Markdown Reader)

Build the fullscreen modal for reading article content.

**Files:**
- Create: `next-app/src/components/ArticleModal.tsx`

**Step 1: Build article modal**

Create `next-app/src/components/ArticleModal.tsx`:

`'use client'` component. Props: `article: Article | null`, `onClose: () => void`.

- Fullscreen overlay with `bg-bg/90 backdrop-blur-sm`
- Framer Motion entrance: fade + slide up
- Close button (X icon, top right)
- Hero image at top (full width, h-[40vh], dark gradient overlay)
- Title + tags over the image
- Content area: fetches markdown from `article.markdown` path via `fetch()`
- Renders with `react-markdown` + `remark-gfm` + `rehype-highlight` + `rehype-raw`
- Custom component mappings for headings, code blocks, blockquotes, images, links
- Styled like the current `.markdown-content-reader` but with ember theme colors
- Scroll container for long content
- ESC key closes modal

**Step 2: Commit**

```bash
git add next-app/src/components/ArticleModal.tsx
git commit -m "feat: add article modal with markdown rendering and syntax highlighting"
```

---

## Task 11: Projects Section — Horizontal Scroll

Build the projects horizontal scroll with basic cards (AI detail panel comes in Task 12).

**Files:**
- Create: `next-app/src/components/Projects.tsx`
- Create: `next-app/src/components/ProjectCard.tsx`

**Step 1: Build ProjectCard**

Create `next-app/src/components/ProjectCard.tsx`:

`'use client'` component. Props: `repo: GitHubRepo`, `isSelected: boolean`, `onClick: () => void`.

- Card: `bg-surface-1` with `border border-surface-3`, rounded
- Fixed width (~300px) for horizontal scroll
- Repo name in Clash Display 600
- Description text (truncated 3 lines)
- Language badge (colored dot + language name)
- Star count with star icon
- Selected state: `border-ember` glow effect
- Hover: subtle `scale-1.03` + ember border hint

**Step 2: Build Projects container**

Create `next-app/src/components/Projects.tsx`:

`'use client'` component. Props: `repos: GitHubRepo[]`.

- Section header: "Projects" in Clash Display
- Horizontal scroll container: `overflow-x-auto flex gap-6 pb-4`
- Custom scrollbar styling (thin, ember-colored)
- Staggered Framer Motion entrance on scroll
- `selectedProject` state — clicking a card sets it
- Below the scroll row: a detail panel area (empty for now, filled in Task 12)

Mobile: switches to vertical stack of cards.

**Step 3: Commit**

```bash
git add next-app/src/components/Projects.tsx next-app/src/components/ProjectCard.tsx
git commit -m "feat: add projects horizontal scroll with selectable cards"
```

---

## Task 12: AI-Powered Generative UI for Projects

Set up the Vercel AI SDK with tools and AI Elements to render rich project details.

**Files:**
- Create: `next-app/.env.local` (gitignored)
- Create: `next-app/src/ai/tools.ts`
- Create: `next-app/app/api/chat/route.ts`
- Create: `next-app/src/components/ProjectDetail.tsx`
- Modify: `next-app/src/components/Projects.tsx`

**Step 1: Create environment file**

Create `next-app/.env.local`:

```
OPENAI_API_KEY=sk-your-key-here
```

Ensure `.env.local` is in `.gitignore` (Next.js does this by default).

**Step 2: Define AI tools**

Create `next-app/src/ai/tools.ts`:

```ts
import { tool } from 'ai'
import { z } from 'zod'

export const displayPackageInfo = tool({
  description: 'Display package/dependency information for a project. Use when the project has notable dependencies, frameworks, or libraries worth highlighting.',
  inputSchema: z.object({
    name: z.string().describe('Package or project name'),
    currentVersion: z.string().optional().describe('Current version'),
    description: z.string().optional().describe('Short description of the package'),
    dependencies: z.array(z.object({
      name: z.string(),
      version: z.string().optional(),
    })).describe('Key dependencies to highlight'),
  }),
  execute: async (input) => input,
})

export const displayCodeSnippet = tool({
  description: 'Display a key code snippet from the project. Use to highlight interesting implementation details, main entry points, or notable patterns.',
  inputSchema: z.object({
    filename: z.string().describe('The filename to display'),
    language: z.string().describe('Programming language for syntax highlighting'),
    code: z.string().describe('The code content to display'),
  }),
  execute: async (input) => input,
})

export const displayFileStructure = tool({
  description: 'Display the project file/directory structure. Use to give an overview of how the project is organized.',
  inputSchema: z.object({
    files: z.array(z.object({
      path: z.string(),
      type: z.enum(['file', 'folder']),
    })).describe('Array of file/folder entries'),
  }),
  execute: async (input) => input,
})

export const displaySetupCommand = tool({
  description: 'Display setup/installation commands for the project. Use to show how to get started with the project.',
  inputSchema: z.object({
    command: z.string().describe('The command to display'),
    label: z.string().optional().describe('Optional label for the command'),
  }),
  execute: async (input) => input,
})

export const tools = {
  displayPackageInfo,
  displayCodeSnippet,
  displayFileStructure,
  displaySetupCommand,
}
```

**Step 3: Create API route**

Create `next-app/app/api/chat/route.ts`:

```ts
import { streamText, UIMessage, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { tools } from '@/ai/tools'

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a project analyzer for a developer portfolio. When given information about a GitHub repository, use the available tools to display rich UI components that help visitors understand the project without going to GitHub.

Always try to use multiple tools to give a comprehensive overview:
- displayPackageInfo for dependencies and tech stack
- displayCodeSnippet for interesting code patterns or main entry point
- displayFileStructure for project organization
- displaySetupCommand for how to install/run

Be concise and highlight what makes the project interesting. Focus on the most important 3-5 dependencies, the most notable code pattern, and the essential setup steps.`,
    messages: await convertToModelMessages(messages),
    tools,
  })

  return result.toUIMessageStreamResponse()
}
```

**Step 4: Create ProjectDetail component**

Create `next-app/src/components/ProjectDetail.tsx`:

`'use client'` component. Props: `repo: GitHubRepo`.

Uses `useChat` from `@ai-sdk/react`. On mount (or when `repo` changes):
1. Sends a message with repo context (name, description, language, URL)
2. Renders message parts by switching on `part.type`:
   - `'text'` → plain text paragraph
   - `'tool-displayPackageInfo'` → `<PackageInfo>` from AI Elements
   - `'tool-displayCodeSnippet'` → `<CodeBlock>` from AI Elements
   - `'tool-displayFileStructure'` → `<FileTree>` from AI Elements
   - `'tool-displaySetupCommand'` → `<Snippet>` from AI Elements
3. Loading states: show shimmer/skeleton while `state === 'input-available'`
4. Error state: show fallback static description

Wrap in a Framer Motion `AnimatePresence` for enter/exit transitions.

**Step 5: Integrate into Projects**

Modify `next-app/src/components/Projects.tsx` to render `<ProjectDetail repo={selectedRepo} />` below the horizontal scroll when a project is selected.

**Step 6: Test the flow**

1. Click a project card
2. Verify the detail panel appears with loading states
3. Verify AI Elements components render with streamed data
4. Verify closing/switching projects works

**Step 7: Commit**

```bash
git add next-app/src/ai/ next-app/app/api/ next-app/src/components/ProjectDetail.tsx
git commit -m "feat: add AI-powered generative UI for project details with AI Elements"
```

---

## Task 13: Footer

Build the minimal footer.

**Files:**
- Create: `next-app/src/components/Footer.tsx`

**Step 1: Build footer**

Create `next-app/src/components/Footer.tsx`:

Simple server component (no `'use client'` needed). Props: `config: Config`.

- `border-t border-surface-3/30`
- Flex row: copyright left ("© 2026 Daniel Brandao"), social links right
- Social icons: small, subtle, `text-text-muted hover:text-ember` transition
- Padding: `py-8 px-6`

**Step 2: Commit**

```bash
git add next-app/src/components/Footer.tsx
git commit -m "feat: add minimal footer with social links"
```

---

## Task 14: Page Assembly and Polish

Wire all components together into the final page. Add entrance animations and scroll behavior.

**Files:**
- Modify: `next-app/src/components/PageClient.tsx`
- Modify: `next-app/app/page.tsx`

**Step 1: Complete PageClient**

Modify `next-app/src/components/PageClient.tsx` to assemble:

```tsx
'use client'

import { useState } from 'react'
import { Config, Article, GitHubRepo } from '@/types'
import { EmberCanvas } from './EmberCanvas'
import { LoadingScreen } from './LoadingScreen'
import { SceneContainer } from './SceneContainer'
import { Hero } from './Hero'
import { Articles } from './Articles'
import { Projects } from './Projects'
import { ArticleModal } from './ArticleModal'
import { DotNav } from './DotNav'
import { Footer } from './Footer'

interface PageClientProps {
  config: Config
  articles: Article[]
  repos: GitHubRepo[]
}

export function PageClient({ config, articles, repos }: PageClientProps) {
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      <EmberCanvas className="fixed inset-0 z-0" />

      <main className="relative z-10">
        <SceneContainer id="hero">
          <Hero config={config} />
        </SceneContainer>

        <SceneContainer id="articles" minHeight>
          <Articles
            articles={articles}
            tags={config.tags}
            onArticleClick={setSelectedArticle}
          />
        </SceneContainer>

        <SceneContainer id="projects" minHeight>
          <Projects repos={repos} />
        </SceneContainer>

        <Footer config={config} />
      </main>

      <DotNav />

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </>
  )
}
```

**Step 2: Visual QA pass**

Check every section in the browser:
- Loading animation plays and transitions smoothly
- Ember particles visible behind all content
- Hero renders with correct fonts and gradient
- Articles grid filters correctly, cards tilt on hover
- Article modal opens with markdown content
- Projects scroll horizontally, AI detail panel works
- Dot nav tracks current section
- Footer renders at bottom
- Mobile responsive: test at 375px, 768px, 1024px, 1440px

**Step 3: Commit**

```bash
git add next-app/
git commit -m "feat: assemble complete Ember Canvas page with all sections"
```

---

## Task 15: Docker and CI/CD

Build the containerization and deployment pipeline.

**Files:**
- Create: `next-app/Dockerfile`
- Modify: `docker-compose.yaml` (root)
- Modify: `.github/workflows/deploy.yaml`

**Step 1: Create Dockerfile**

Create `next-app/Dockerfile`:

```dockerfile
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

**Step 2: Update root Dockerfile**

Update the root `Dockerfile` to build from `next-app/` instead of `react-app/`:

```dockerfile
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY next-app/package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY next-app/ .
ENV NODE_ENV=production
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

**Step 3: Update docker-compose.yaml**

Update `docker-compose.yaml`:

```yaml
services:
  dev:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./next-app:/app
      - next_node_modules:/app/node_modules
    ports:
      - "3000:3000"
    command: sh -c "npm install && npm run dev -- --hostname 0.0.0.0"
    environment:
      - NODE_ENV=development
      - OPENAI_API_KEY=${OPENAI_API_KEY}

  web:
    build: .
    ports:
      - "80:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    profiles:
      - production

volumes:
  next_node_modules:
```

**Step 4: Update GitHub Actions workflow**

Update `.github/workflows/deploy.yaml`:

- Change port mapping: `-p 80:3000` instead of `-p 80:80`
- Add `OPENAI_API_KEY` from GitHub secrets: `--env OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}`
- Update test endpoints (same paths, port 80 still works from outside)
- Update verification: `docker build --no-cache -t personal-website .`
- Remove nginx references

**Step 5: Test Docker build locally**

```bash
cd /Users/danielbrandao/Documents/proxmox/websitev2
docker build -t personal-website-next .
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-test personal-website-next
```

Verify http://localhost:3000 loads the site.

**Step 6: Commit**

```bash
git add Dockerfile docker-compose.yaml .github/workflows/deploy.yaml next-app/Dockerfile
git commit -m "feat: update Docker and CI/CD pipeline for Next.js standalone deployment"
```

---

## Task 16: Final Cleanup and Type Checking

Run linting, type checking, and clean up any issues.

**Files:**
- Various fixes across `next-app/`

**Step 1: Type check**

```bash
cd next-app && npx tsc --noEmit
```

Fix any TypeScript errors.

**Step 2: Lint**

```bash
cd next-app && npm run lint
```

Fix any ESLint issues.

**Step 3: Build test**

```bash
cd next-app && npm run build
```

Ensure production build succeeds with zero errors.

**Step 4: Full Docker test**

```bash
cd /Users/danielbrandao/Documents/proxmox/websitev2
docker build -t personal-website-test .
docker run -d --name test-site -p 3001:3000 -e OPENAI_API_KEY=${OPENAI_API_KEY} personal-website-test
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/config/config.json
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/config/articles.json
docker rm -f test-site
```

All endpoints should return 200.

**Step 5: Commit**

```bash
git add -A
git commit -m "fix: resolve type errors, lint issues, and verify production build"
```

---

## Task Summary

| # | Task | Dependencies | Estimated Complexity |
|---|---|---|---|
| 1 | Scaffold Next.js project | None | Low |
| 2 | Migrate static assets | Task 1 | Low |
| 3 | Theme system (Tailwind v4 + fonts) | Task 1 | Medium |
| 4 | Type definitions and data hooks | Task 1 | Low |
| 5 | Ember particle background | Task 3 | High |
| 6 | Loading screen | Task 5 | High |
| 7 | Scene layout and navigation | Task 3 | Medium |
| 8 | Hero section | Task 4, 7 | Medium |
| 9 | Articles bento grid | Task 4, 7 | Medium |
| 10 | Article modal | Task 9 | Medium |
| 11 | Projects horizontal scroll | Task 4, 7 | Medium |
| 12 | AI generative UI for projects | Task 11 | High |
| 13 | Footer | Task 4 | Low |
| 14 | Page assembly and polish | Tasks 5-13 | Medium |
| 15 | Docker and CI/CD | Task 14 | Medium |
| 16 | Final cleanup and verification | Task 15 | Low |

**Parallelizable tasks**: Tasks 5+6 (particles), 8 (hero), 9+10 (articles), 11+12 (projects), and 13 (footer) can be developed in parallel once Tasks 1-4 and 7 are done.
