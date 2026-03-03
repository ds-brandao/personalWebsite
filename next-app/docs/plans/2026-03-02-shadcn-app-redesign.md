# shadcn App Redesign

## Overview

Pivot from scroll-driven single-page portfolio to a mobile-first app-like experience built on shadcn components. Bottom tab navigation on mobile, top navbar on desktop. Four sections: Home, Articles, Projects, Profile.

## Architecture

### Routing (Next.js App Router)

```
app/
├── layout.tsx              ← root: fonts, ThemeProvider, AppShell
├── (tabs)/
│   ├── layout.tsx          ← tab layout: BottomTabBar (mobile) + TopNav (desktop)
│   ├── page.tsx            ← Home (activity feed)
│   ├── articles/
│   │   ├── page.tsx        ← article list with tag filters
│   │   └── [slug]/
│   │       └── page.tsx    ← full article reader
│   ├── projects/
│   │   └── page.tsx        ← project grid
│   └── profile/
│       └── page.tsx        ← bio, socials, featured
├── fonts.ts                ← keep as-is
└── globals.css             ← keep warm palette, strip scroll animation CSS
```

Each tab is a real route. Server components fetch data. Shareable URLs.

### Navigation

**Mobile (< md):**
- Fixed bottom tab bar with neumorphic styling (soft inset shadow, raised pill on active)
- 4 tabs: Home (House), Articles (FileText), Projects (Code), Profile (User)
- Active tab: rust color + raised pill background
- `layoutId` animated indicator sliding between tabs

**Desktop (md+):**
- Sticky top navbar with backdrop blur
- Name/logo left, nav links right, theme toggle
- No bottom tab bar

Both use `usePathname()` for active state and `<Link prefetch>` for instant switches.

### Pages

**Home (`/`)**
- Brief hero: name + tagline (Fraunces display heading)
- Activity feed: recent commits across public GitHub repos
- Rendered using existing `Commit` component from `ai-elements/commit.tsx`
- Data: `getRepoCommits()` from `lib/data.ts`

**Articles (`/articles`)**
- Tag filter bar: shadcn `ToggleGroup` at top
- Article list: shadcn `Card` per article (thumbnail, title, summary, `Badge` tags)
- Stagger-in animation on load

**Article Detail (`/articles/[slug]`)**
- Full-page reader replacing the modal approach
- Markdown rendering: ReactMarkdown + rehype-highlight + rehype-raw + remark-gfm
- Mermaid diagram support (keep existing component)
- Hero image with gradient overlay at top
- Back navigation

**Projects (`/projects`)**
- Responsive grid of shadcn `Card` components
- Each card: repo name, description, language dot, star count, GitHub link
- Click expands inline detail panel with PackageInfo + Commit components from `ai-elements/`

**Profile (`/profile`)**
- Bio/about section
- Social links (GitHub, LinkedIn, Email)
- Featured mentions (CoE Cyber article)

### Component Plan

**Keep (reuse):**
- `ui/*` — all existing shadcn primitives
- `ai-elements/commit.tsx` — commit display for Home feed + project details
- `ai-elements/package-info.tsx` — project detail panel
- `ThemeProvider.tsx`, `ThemeToggle.tsx`
- `Mermaid.tsx` — article rendering
- `lib/utils.ts` (cn), `lib/data.ts` (data fetching)
- All `public/` content (config, articles, blog-posts, images)
- Fonts: Fraunces + Plus Jakarta Sans
- Warm Claude color palette CSS variables

**Build new:**
- `BottomTabBar` — neumorphic mobile tab nav with layoutId indicator
- `TopNav` — desktop sticky navbar
- `AppShell` — responsive wrapper (shows correct nav per breakpoint)
- `ArticleCard` — card for article list
- `ArticlePage` — full-page article reader
- `ProjectCard` — card for project grid

**Remove:**
- `PageClient.tsx` — replaced by App Router layout
- `Hero.tsx` — replaced by Home page hero
- `ArticleSpread.tsx` — replaced by ArticleCard
- `ArticleModal.tsx` — replaced by ArticlePage route
- `ProjectFrame.tsx` — replaced by ProjectCard
- `ProjectDetail.tsx` — inline in projects page
- `ParallaxDepth.tsx` — no parallax
- `ScrollRevealText.tsx` — no scroll animations
- `Footer.tsx` — content moves to Profile tab
- `Navbar.tsx` — replaced by TopNav + BottomTabBar
- `PenguinCompanion.tsx` + `sprites.ts` — dropped
- `Articles.tsx`, `Projects.tsx` — replaced by route pages

### Visual Design

**Palette:** Warm Claude colors (cream, taupe, rust, brown) applied via CSS variables. Same light/dark toggle.

**Typography:** Fraunces (display headings) + Plus Jakarta Sans (body). No changes.

**Neumorphism:** Bottom tab bar only. Soft inset shadow on bar, raised pill on active tab. All other UI is standard flat shadcn.

### Animations

Subtle, functional motion via `motion` library:
- Page transitions: fade or slide-up on route change
- List stagger: cards animate in with delay offsets (`whileInView`)
- Hover/press: slight scale or shadow lift on cards
- Tab indicator: `layoutId` sliding pill between tabs
- No scroll-linked transforms, no parallax, no letter-spacing effects

### Data Flow

No changes to data fetching strategy:
- Server components fetch from `public/config/*.json` + GitHub API
- `getConfig()`, `getArticles()`, `getGitHubRepos()`, `getRepoCommits()` in `lib/data.ts`
- ISR with 24h revalidation
- Article markdown fetched at build time for `/articles/[slug]` pages
