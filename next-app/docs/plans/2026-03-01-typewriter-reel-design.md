# Typewriter Reel — Design Document

**Goal:** Transform the portfolio from a conventional stacked-section layout into a cinematic scrollytelling experience where scroll position drives the narrative.

**Palette & Typography:** Keep the existing Claude Color Palette and Fraunces + Plus Jakarta Sans font pairing. The rethink is purely structural and spatial.

**Tech:** All scroll-linked animations via `motion/react` (`useScroll`, `useTransform`, `whileInView`). No new dependencies.

---

## Scroll Model

The page is a single continuous scroll with four "scenes." Each scene occupies the full viewport height (or more) and uses scroll position to drive content reveals, transforms, and transitions.

```
Scene 1: Hero .............. 100vh (scroll-linked typography)
Scene 2: Articles .......... ~300vh+ (editorial full-bleed cards)
Scene 3: Projects .......... (N+1)×100vh (horizontal scroll reel)
Scene 4: Footer ............ 100vh (cinematic closing)
```

Navigation: Sticky Navbar, transparent over Hero, thin backdrop-blur bar elsewhere. Scroll progress indicator replaces section dots.

---

## Scene 1: Hero

Full-viewport typographic moment. The name IS the architecture.

**Scroll behavior (target: hero container, 100vh):**
- **0%–50%:** Name "Daniel Brandao" in massive Fraunces Black (~15-20vw). Letter-spacing expands from `0em` to `~0.5em` via `useTransform`. Title/tagline fades up from below (`opacity: 0→1`, `y: 40→0`) into the space between letters.
- **50%–100%:** Entire composition fades out (`opacity: 1→0`) and translates up (`y: 0→-100`). Social icons (email, LinkedIn, GitHub) appear at bottom as bordered circles with staggered fade-in.

**No loading screen.** The hero is the entrance. Name starts visible immediately.

---

## Scene 2: Articles

Full-bleed editorial layout. Each article is an asymmetric spread, not a card in a grid.

**Section header:** "Writing" heading with scroll-linked word reveal — each word transitions from 15% to 100% opacity as scroll progresses through the header region.

**Tag filter bar:** Sticks below navbar when scrolling through articles. Toggle pills filter with `AnimatePresence` collapse/expand animations.

**Article layout (each ~80vh):**
- Left 60%: Large Fraunces title (3-4rem), summary text (Plus Jakarta Sans), tag pills at bottom
- Right 40%: Article image with subtle parallax offset (0.7x scroll speed)
- Enter animation: `whileInView` slide-up + fade, `once: true`

**Mobile:** Stacks vertically — image on top, title + summary below. Each article still gets generous vertical space.

**Click behavior:** Opens existing ArticleModal (shadcn Dialog + ScrollArea). No changes to modal.

---

## Scene 3: Projects (Horizontal Scroll)

Signature interaction. Vertical scroll drives horizontal reel.

**Structure:**
- Outer container: `height: (N+1) * 100vh` (creates scroll distance)
- Inner sticky container: `height: 100vh`, `position: sticky`, `top: 0`, `overflow: hidden`
- Project track: `motion.div` with `style={{ x }}` where `x = useTransform(scrollYProgress, [0, 1], ["0%", "-{(N-1)/N * 100}%"])`

**Each project frame (~90vw):**
- Large repo name in Fraunces (left-aligned)
- Description below in Plus Jakarta Sans
- Language indicator (colored dot + name), star count
- Background: project language color at 5% opacity as full-frame wash

**First frame:** "Projects" section title (not a repo). Scrolls away to reveal first project.

**Project expansion:** Click a frame to expand ProjectDetail below (commits, package info). While expanded, detail panel appears within the sticky container. Close to collapse.

**Progress indicator:** Thin horizontal line at bottom of sticky container. `scaleX` driven by same `scrollYProgress`.

---

## Scene 4: Footer

Cinematic fade-to-black closing. Full viewport height.

**Scroll-in behavior:**
- Background transitions to Deep Noir (#0E0A08) regardless of theme
- Name appears centered in Fraunces, muted taupe color
- Social icons fade in with stagger below
- Copyright line at very bottom, barely visible

Creates a "credits sequence" — the page ends with the same weight it began with.

---

## Interactive Elements

### Penguin Narrator (replaces free-roaming companion)

Scripted appearances at specific scroll positions:
1. Peeks from right edge during hero → articles transition
2. Sits on the progress bar during horizontal projects scroll
3. Waves goodbye in footer scene

Each appearance triggered by scroll position ranges. Still uses pixel-art sprite system. Positioned absolutely relative to viewport. Hidden on mobile.

### Atmospheric Depth (replaces SporeCanvas)

No more canvas particle system. Instead:
- Paper grain texture stays on main content (existing `.paper-grain` class)
- CSS parallax background: large, soft, blurred circles of palette colors (taupe, cream) at 0.3x scroll speed
- Lighter than canvas, reinforces depth without competing with content

### Loading Screen

Deleted entirely. The hero provides the entrance moment. All data is server-fetched. Font loading handled by `next/font` with `display: swap`.

---

## Navbar Changes

- Transparent over Hero, thin backdrop-blur bar after scrolling past hero
- Section indicators show scroll progress (thin bar) rather than active dots
- Same mobile hamburger menu pattern
- Theme toggle stays

---

## What Stays Unchanged

- Claude Color Palette (all CSS tokens)
- Fraunces + Plus Jakarta Sans fonts
- shadcn/ui components (Dialog, Card, Toggle, ScrollArea, etc.)
- next-themes for light/dark
- ArticleModal internals
- ProjectDetail content rendering
- Type system and data flow (server component fetches → client component renders)
- Mermaid diagram theming
- ThemeProvider and ThemeToggle

## What Changes

| Component | Current | New |
|---|---|---|
| PageClient | Stacked sections | Scene-based scroll layout |
| Hero | Staggered fade-in | Scroll-linked letter-spacing expansion |
| Articles | Masonry CSS columns grid | Full-bleed editorial spreads |
| Projects | 3-column card grid + expand | Horizontal scroll reel |
| Footer | Simple separator + links | Cinematic fade-to-black |
| Navbar | Scroll-based bg change | + Scroll progress indicator |
| Penguin | Free-roaming physics | Scripted narrator appearances |
| SporeCanvas | Canvas particle system | CSS parallax depth layer |
| LoadingScreen | Timed spinner overlay | Deleted |

## Dependencies

No new npm packages. Everything achievable with:
- `motion/react` (already installed): `useScroll`, `useTransform`, `useMotionValueEvent`, `whileInView`, `AnimatePresence`
- CSS: `position: sticky`, parallax via `transform`, backdrop-filter
- Existing shadcn components
