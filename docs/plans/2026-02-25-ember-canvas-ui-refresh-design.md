# Ember Canvas — UI Refresh Design

## Overview

Nuclear rebuild of the personal portfolio website. Replaces the current Vite + React dark glassmorphic design with a bold, art/experimental aesthetic built on Next.js 15, featuring interactive ember particle effects and AI-powered generative UI for the projects section.

## Stack

| Layer | Technology | Replaces |
|---|---|---|
| Framework | Next.js 15 (App Router) | Vite + React 19 |
| Styling | Tailwind CSS v4 + CSS custom properties | Tailwind v3 |
| Animation | Framer Motion | Manual CSS + Framer Motion |
| Particles | Custom Canvas API (ember system) | tsparticles + custom canvas |
| AI | Vercel AI SDK + OpenAI provider | N/A |
| AI UI | AI Elements (PackageInfo, CodeBlock, FileTree, Snippet) | N/A |
| Fonts | Clash Display + General Sans (Fontshare) | Inter + JetBrains Mono |
| Deploy | Docker standalone (multi-stage) | Docker nginx |

## Data Sources (Preserved)

- `/public/config/config.json` — personal info, social links, tags
- `/public/config/articles.json` — blog metadata
- `/public/blog-posts/*.md` — markdown article content
- GitHub API — project repos (via Next.js API route proxy)

## Color System

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0c0a09` (stone-950) | Page background |
| `--surface-1` | `#1c1917` (stone-900) | Card backgrounds |
| `--surface-2` | `#292524` (stone-800) | Elevated surfaces |
| `--surface-3` | `#44403c` (stone-700) | Borders, dividers |
| `--ember` | `#f97316` (orange-500) | Primary accent |
| `--ember-glow` | `#fb923c` (orange-400) | Hover states |
| `--ember-hot` | `#ea580c` (orange-600) | Active states |
| `--amber` | `#f59e0b` | Secondary warm accent |
| `--coral` | `#f43f5e` (rose-500) | Tertiary accent |
| `--text-primary` | `#fafaf9` (stone-50) | Primary text |
| `--text-secondary` | `#a8a29e` (stone-400) | Secondary text |
| `--text-muted` | `#78716c` (stone-500) | Muted text |

Brand gradient: `linear-gradient(135deg, #f97316, #f59e0b, #f43f5e)`

## Typography

- **Display**: Clash Display 700 — hero name, section headers. Fluid sizing via `clamp(4rem, 10vw, 12rem)`.
- **Headings**: Clash Display 600 — card titles, section labels
- **Body**: General Sans 400/500 — readable, slightly geometric
- **Mono**: JetBrains Mono — code blocks, AI Elements, technical details
- All sizing uses fluid `clamp()` — no fixed breakpoints for type

## Page Structure

### Scene 0: Loading

Ember particle burst animation on a `<canvas>`. "DSB" letterforms assemble from ember particles, hold briefly, then dissolve outward — particles transition into the persistent background field. Colors shift through the warm palette (orange → amber → coral).

### Scene 1: Hero (100vh)

Full-viewport hero section:
- Name rendered in oversized Clash Display with warm gradient text fill
- "Software Engineer" subtitle
- Short bio paragraph
- Social icons (Email, LinkedIn, GitHub)
- Animated scroll-down indicator at bottom
- Content enters with staggered Framer Motion reveals on scroll

### Scene 2: Articles (min 100vh)

Bento/masonry grid layout:
- Filter tags row at top (All + dynamic tags from config)
- Featured article spans wider with larger image
- Regular articles in varied-size grid cells
- Cards tilt subtly on hover (3D CSS perspective transforms)
- Click opens article modal (full markdown reader with syntax highlighting)
- Staggered entrance animations triggered by scroll

### Scene 3: Projects (min 100vh)

Horizontal scroll of project cards:
- Cards fetched from GitHub API via Next.js API route
- Show repo name, description, stars, primary language
- **Click a project → AI-powered detail panel expands below**

#### Generative UI Detail Panel

Uses Vercel AI SDK `useChat` with tools. When a project is selected:

1. GitHub API fetches: README, package.json, file tree, languages
2. Data sent as context to `POST /api/chat` route
3. LLM (OpenAI) decides which tools to call based on project content
4. Tool results render as AI Elements components:

| Tool | Component | Shows |
|---|---|---|
| `displayPackageInfo` | `<PackageInfo />` | Dependencies, versions, tech stack |
| `displayCodeSnippet` | `<CodeBlock />` | Key code excerpts |
| `displayFileStructure` | `<FileTree />` | Directory structure |
| `displaySetupCommand` | `<Snippet />` | Install/run commands |

Components stream in progressively with loading states.

**Performance safeguards:**
- Rate limit: 10 AI requests per visitor session
- Cache: generated responses cached per project (24h revalidation)
- Fallback: static project description if AI unavailable or rate-limited

### Footer

Minimal footer with copyright, social links, warm-toned border.

### Navigation

No traditional navbar. Floating dot-indicator on the right edge:
- Dots represent each scene
- Current scene highlighted in ember color
- Click to jump between scenes
- Scene labels appear on hover

## Background: Ember Particle Canvas

Persistent `<canvas>` element behind all content (z-index 0):
- ~100-150 ember particles drifting upward slowly
- Particles use warm gradient colors (orange/amber/coral)
- Mouse proximity causes gentle repulsion/attraction
- Particles have slight glow effect (radial gradient rendering)
- Opacity varies between scenes for depth
- Reduced count on mobile for performance

## Responsive Strategy

Three breakpoints, same scene structure:
- **Desktop (lg+)**: Full layouts as described
- **Tablet (md)**: Bento grid reduces columns, project scroll horizontal
- **Mobile**: Single column stack, vertical project cards, full-width detail panel, reduced particles (~50)

All typography uses fluid `clamp()` — no jump points.

## Containerization

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

- `next.config.js` → `output: 'standalone'`
- `OPENAI_API_KEY` injected at runtime via Docker env
- GitHub Actions workflow updated: build Next.js standalone → deploy container on port 3000
- Health check endpoints: `/`, `/config/config.json`, `/config/articles.json`

## Key Differences from Current Design

| Aspect | Current | Ember Canvas |
|---|---|---|
| Framework | Vite + React 19 (SPA) | Next.js 15 (App Router, SSR) |
| Theme | Cool (indigo on black) | Warm (orange/amber on warm black) |
| Glass style | Frosted glassmorphism | Solid surfaces with ember glow accents |
| Layout | 3-column grid | Full-viewport scroll scenes |
| Navigation | None (scroll only) | Floating dot indicator |
| Fonts | Inter + JetBrains Mono | Clash Display + General Sans |
| Projects | Static cards | AI-powered generative UI detail panel |
| Particles | Horizontal wave field | Upward-drifting embers with mouse interaction |
| Cards | Glass blur effect | 3D perspective tilt on hover |
