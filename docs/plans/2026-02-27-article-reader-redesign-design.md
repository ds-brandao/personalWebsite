# Article Reader Redesign

**Date:** 2026-02-27
**Status:** Approved

## Problem

The current article viewer uses a full-viewport modal overlay. This feels disconnected from the site, has no article-to-article navigation, and renders content with minimal visual character.

## Design Decision

**Approach A: Animated Section Swap** — the articles section manages two modes (grid and reader) and transitions between them inline. No modal, no route changes.

## Architecture

```
Articles.tsx (owns selectedArticle state)
├── Grid mode: tag filters + ArticleCard bento grid
└── Reader mode: ArticleReader (inline, scrollable)
    ├── Sticky nav bar (back + title + prev/next)
    ├── Hero image with gradient
    ├── Article content (markdown)
    └── Bottom nav (prev/next article cards)
```

### State Changes

- `selectedArticle` state moves from `PageClient` into `Articles`
- `PageClient` no longer renders `ArticleModal`
- `ArticleModal.tsx` is deleted, replaced by `ArticleReader.tsx`

## Reader View Layout

**Sticky nav bar** (sticks on scroll):
- Left: Back arrow + "Back to articles"
- Center: Current article title (truncated)
- Right: Prev/Next arrow buttons (disabled at boundaries)
- Style: `surface-1` bg, `surface-3` bottom border, backdrop blur

**Hero image:** Full-width, `h-[35vh]`, gradient overlay fading to bg. Title and tags overlaid at bottom.

**Content area:**
- `max-w-3xl mx-auto` for comfortable line length
- Custom markdown component overrides (no `@tailwindcss/typography` dependency)
- Code blocks with syntax highlighting, Mermaid diagram rendering
- Clean dev-blog styling: good spacing, readable typography

**Bottom navigation:** Prev/next article preview cards (title + image), clickable.

**Scroll:** Normal body scroll (no overflow hidden). Scroll to articles section top on enter.

## Transitions

**Grid to Reader:**
- Grid fades out (`opacity: 0, scale: 0.98`, ~200ms)
- Reader fades in (`opacity: 0, y: 20` to `opacity: 1, y: 0`, ~300ms)
- `AnimatePresence mode="wait"`
- `scrollIntoView` to articles section top

**Reader to Grid:** Reverse of above.

**Prev/Next within Reader:**
- Content crossfades (fade out current, fade in new)
- Sticky nav persists, no full re-transition
- Scroll to top of reader content

## Keyboard Shortcuts

- `Escape` — back to grid
- `ArrowLeft` / `ArrowRight` — prev/next article (reader mode only)

## Files Affected

- `components/Articles.tsx` — add selectedArticle state, conditional rendering
- `components/ArticleReader.tsx` — new component (replaces ArticleModal)
- `components/Mermaid.tsx` — no changes, reused by ArticleReader
- `components/PageClient.tsx` — remove selectedArticle state and ArticleModal
- `components/ArticleModal.tsx` — delete
