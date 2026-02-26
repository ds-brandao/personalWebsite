# Living Penguin Character - V2 Design

## Summary

Expand the pixel art penguin from a fixed-corner mascot into a full page-exploring character. The penguin walks on visible surfaces (card tops, section edges, footer), jumps between waypoints, and performs contextual mischief actions (belly slides, napping, pecking at headings, pushing cards, dancing).

## Architecture

### Full-Viewport Overlay Canvas

Replace the small fixed canvas with a full-screen fixed canvas:
- `position: fixed; inset: 0; z-index: 30`
- `pointer-events: none` on canvas; click detection via window listener with hit-test
- DPR-aware, resizes with window
- Penguin drawn at page coordinates translated to viewport: `viewportY = worldY - scrollY`

### Coordinate System

The penguin lives in **page coordinates** (document space). When drawing, convert to viewport: `viewportY = worldY - window.scrollY`. The penguin stays at its page position when the user scrolls -- it lives *in* the document.

## Waypoint System

```typescript
interface Waypoint {
  id: string;
  getRect: () => DOMRect | null;
  surface: "top" | "bottom";
  actions: PenguinAction[];
  connections: string[];
}
```

### Waypoint Locations

| ID | Element | Surface | Actions |
|----|---------|---------|---------|
| `hero-floor` | Bottom of #hero | top | idle, dance, belly-slide |
| `articles-top` | Top of #articles | top | walk, peck-heading |
| `card-0..N` | Article card tops | top | sit, nap, peck, belly-slide |
| `projects-top` | Top of #projects | top | walk, peck-heading |
| `project-card-0..N` | Project card tops | top | sit, push, belly-slide |
| `footer-top` | Top of footer | top | nap, sit, dance |
| `ground` | Viewport bottom | bottom | walk (default spawn) |

Waypoints queried dynamically via `getRect()` using `getBoundingClientRect() + scrollY`. Connections define reachable neighbors.

## Movement System

- **Walking:** Horizontal movement at ~1.5px/frame toward target x
- **Jumping:** Parabolic arc between connected waypoints
- **Falling off edges:** Trip animation then fall to nearest lower surface
- **Direction:** Canvas flips horizontally for left-facing movement (no separate left sprites)

## Behavior Tree

```
Every 3-8 seconds:
  If on a waypoint with actions:
    40% contextual action (peck, nap, sit, push, dance)
    30% walk to connected waypoint
    20% belly-slide across surface
    10% idle animation (look, yawn, shuffle)
  If mid-transit:
    Continue to destination
  If just arrived:
    60% contextual action
    40% pick another destination
```

Scroll reactions preserved: scroll-down -> falling, fast scroll-up -> tumble.

## New Animation States (10 new, 9 existing)

| State | Frames | Description |
|-------|--------|-------------|
| `walk-right` | 4 | Waddling right |
| `walk-left` | 4 | Mirror of walk-right via canvas flip |
| `jump` | 2 | Jumping up/across |
| `belly-slide` | 2 | Sliding on belly |
| `sit` | 2 | Sitting on surface edge |
| `nap` | 3 | Lying down, eyes closed |
| `dance` | 4 | Happy wiggle |
| `peck` | 3 | Pecking downward |
| `trip` | 2 | Stumbling at edge |
| `push` | 3 | Pushing against something |

~29 new sprite frames + existing 16 = ~45 total.

## File Structure

```
next-app/components/penguin/
├── sprites.ts          -- EXPANDED with new frames + animation defs
├── waypoints.ts        -- NEW: waypoint definitions + query functions
├── behavior.ts         -- NEW: behavior tree / decision engine
├── PenguinCompanion.tsx -- REWRITTEN: full-viewport canvas, movement, behavior
└── index.ts            -- unchanged
```

## Integration

PageClient.tsx unchanged -- `<PenguinCompanion />` already rendered. The component internally switches to full-viewport overlay. Key DOM elements queried by ID for waypoint positions.
