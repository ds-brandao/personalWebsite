# Interactive Pixel Penguin Companion

## Summary

A fixed-position Canvas-rendered pixel art penguin in the bottom-left corner of the viewport (desktop only). The penguin reacts to scroll events with physics-based animations and has idle behaviors and click interactions.

## Visual Style

- **Pixel art** drawn on Canvas via 2D grid arrays (same approach as LoadingScreen letter grids)
- **Size:** 64px penguin on ~80x80px canvas
- **Position:** Fixed, bottom-left (`bottom: 16px, left: 24px`), z-index 30
- **Colors:** Body uses surface-1/text-primary (black/white), beak/feet use accent orange (#f97316)
- **Visibility:** Desktop only (`hidden md:block`)

## Animation States

| State | Trigger | Frames | Description |
|-------|---------|--------|-------------|
| `idle` | Default | 2 | Standing still, subtle breathing |
| `idle-look` | No scroll ~5s | 3 | Looks left/right |
| `idle-yawn` | No scroll ~10s | 4 | Opens beak, stretches |
| `idle-shuffle` | No scroll ~7s | 3 | Shifts weight side to side |
| `falling` | Scroll down | 2 | Flapping wings, falling |
| `landing` | Scroll stops after down | 3 | Squish on impact, recovery |
| `tumble` | Scroll up fast | 3 | Falls backwards |
| `getting-up` | After tumble | 4 | Gets back on feet |
| `poked` | Click | 3 | Startled jump + wobble |

## Physics Model

- Penguin rests at viewport bottom ("floor")
- Scroll down: free-fall with gravity acceleration, terminal velocity cap
- Scroll stop after down: landing with squish + slight bounce
- Scroll up fast: tumble (falls backward), then gets-up animation
- Constants: gravity, terminal velocity, bounce factor

## Scroll Detection

- Listen to window `scroll` event
- Track scrollY delta between frames
- Positive delta (down) -> falling state with gravity
- Negative delta (up fast) -> tumble state
- Zero delta after falling -> landing state

## Idle Behavior

Timer-based random idle animations when in idle state:
- 5s: 50% chance idle-look
- 7s: 30% chance idle-shuffle
- 10s: 20% chance idle-yawn

## Click Interaction

Canvas click detection on penguin bounding box triggers `poked` state (startled jump).

## Integration

Sibling to EmberCanvas in PageClient.tsx:
```
PageClient
├── LoadingScreen (z-50)
├── EmberCanvas (z-0)
├── PenguinCompanion (z-30, fixed, bottom-left) <- NEW
├── SceneContainer sections...
├── DotNav (z-40)
```

## Implementation Approach

Canvas-based rendering with own requestAnimationFrame loop throttled to ~30fps. Sprite definitions as 2D number arrays mapping to color palette. State machine manages transitions between animation states.

## Technical Decisions

- Canvas over CSS sprites for consistency with existing EmberCanvas pattern
- 30fps cap since pixel art doesn't benefit from higher framerates
- Separate RAF loop to avoid coupling with EmberCanvas
- State machine pattern for clean animation transitions
