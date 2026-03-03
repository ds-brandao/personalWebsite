# Penguin Companion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an interactive pixel art penguin to the bottom-left of the page that reacts to scrolling, has idle animations, and responds to clicks.

**Architecture:** A single `PenguinCompanion` React component rendering a small Canvas. Sprite data lives in a separate file as 2D grid arrays (matching LoadingScreen's letter grid pattern). A state machine drives animation transitions. Scroll events, idle timers, and click handlers trigger state changes.

**Tech Stack:** React 19, Canvas API, TypeScript. No new dependencies.

---

### Task 1: Create Penguin Sprite Data

**Files:**
- Create: `next-app/components/penguin/sprites.ts`

**Context:** The LoadingScreen uses 2D number arrays where `1` = filled pixel, `0` = empty. We extend this: each cell is a number mapping to a color palette index. `0` = transparent, `1` = black body (#1c1917), `2` = white belly (#fafaf9), `3` = orange beak/feet (#f97316), `4` = eye white (#fafaf9), `5` = eye pupil (#0c0a09).

**Step 1: Create the sprite data file**

Create `next-app/components/penguin/sprites.ts` with:

```typescript
// Color palette: index -> hex color
// 0 = transparent, 1 = body dark, 2 = belly white, 3 = orange accent, 4 = eye white, 5 = pupil
export const PENGUIN_PALETTE = [
  "transparent", // 0
  "#1c1917",     // 1 - body (surface-1)
  "#fafaf9",     // 2 - belly (text-primary)
  "#f97316",     // 3 - beak/feet (accent)
  "#fafaf9",     // 4 - eye white
  "#0c0a09",     // 5 - pupil
];

// Each sprite is a 2D array of palette indices
// Penguin is 12x16 pixels, rendered at 4x scale = 48x64 on canvas
export type SpriteFrame = number[][];

// --- IDLE ---
// Standing, wings down
export const IDLE_1: SpriteFrame = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,1,1,1,2,2,2,2,1,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

// Standing, wings slightly up (breathing)
export const IDLE_2: SpriteFrame = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,1,1,1,2,2,2,2,1,1,1,0],
  [1,1,1,2,2,2,2,2,2,1,1,1],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

// --- IDLE LOOK (eyes shift left, center, right) ---
export const LOOK_LEFT: SpriteFrame = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,5,4,1,1,5,4,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,1,1,1,2,2,2,2,1,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

export const LOOK_RIGHT: SpriteFrame = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,1,1,1,2,2,2,2,1,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

// --- IDLE YAWN (beak opens progressively) ---
export const YAWN_1: SpriteFrame = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,3,3,3,3,1,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,1,1,1,2,2,2,2,1,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

// --- IDLE SHUFFLE (lean left, center, lean right) ---
export const SHUFFLE_LEFT: SpriteFrame = [
  [0,0,0,1,1,1,1,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,0,0,0],
  [0,1,4,5,1,1,4,5,1,0,0,0],
  [0,1,1,1,1,1,1,1,1,0,0,0],
  [0,1,1,1,3,3,1,1,1,0,0,0],
  [1,1,1,2,2,2,2,1,1,1,0,0],
  [1,1,2,2,2,2,2,2,1,1,0,0],
  [1,1,2,2,2,2,2,2,1,1,0,0],
  [0,1,2,2,2,2,2,2,1,1,0,0],
  [0,1,1,2,2,2,2,1,1,0,0,0],
  [0,0,1,1,2,2,1,1,0,0,0,0],
  [0,0,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,0,0,0,0,0],
  [0,0,0,3,3,3,3,0,0,0,0,0],
  [0,0,3,3,0,0,3,3,0,0,0,0],
];

export const SHUFFLE_RIGHT: SpriteFrame = [
  [0,0,0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,4,5,1,1,4,5,1,0],
  [0,0,0,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,1,1,3,3,1,1,1,0],
  [0,0,1,1,2,2,2,2,1,1,1,1],
  [0,0,1,1,2,2,2,2,2,2,1,1],
  [0,0,1,1,2,2,2,2,2,2,1,1],
  [0,0,1,1,2,2,2,2,2,2,1,0],
  [0,0,0,1,1,2,2,2,2,1,1,0],
  [0,0,0,0,1,1,2,2,1,1,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0],
  [0,0,0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,0,3,3,3,3,0,0,0],
  [0,0,0,0,3,3,0,0,3,3,0,0],
];

// --- FALLING (wings up, flapping) ---
export const FALLING_1: SpriteFrame = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [1,1,1,1,2,2,2,2,1,1,1,1],
  [1,0,1,2,2,2,2,2,2,1,0,1],
  [0,0,1,2,2,2,2,2,2,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,3,0,0,3,0,0,0,0],
  [0,0,0,0,3,0,0,3,0,0,0,0],
];

export const FALLING_2: SpriteFrame = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [1,1,1,2,2,2,2,2,2,1,1,1],
  [1,0,1,2,2,2,2,2,2,1,0,1],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,3,0,0,3,0,0,0,0],
  [0,0,0,0,3,0,0,3,0,0,0,0],
];

// --- LANDING (squish on impact, recover) ---
export const LANDING_1: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,1,1,1,2,2,2,2,1,1,1,0],
  [1,1,1,2,2,2,2,2,2,1,1,1],
  [1,1,2,2,2,2,2,2,2,2,1,1],
  [1,1,2,2,2,2,2,2,2,2,1,1],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,1,2,2,2,2,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,3,3,3,0,0,3,3,3,0,0],
  [0,3,3,0,0,0,0,0,0,3,3,0],
];

export const LANDING_2: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,1,1,1,2,2,2,2,1,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

// --- TUMBLE (falls backward) ---
export const TUMBLE_1: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,1],
  [0,0,0,0,0,0,0,0,0,1,1,1],
  [3,3,1,1,1,2,2,1,1,1,1,0],
  [0,3,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,1,1,1,5,4,1,0,0],
  [0,0,0,1,1,1,1,5,4,1,0,0],
  [0,0,0,0,1,1,3,3,1,0,0,0],
];

export const TUMBLE_2: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [3,3,0,0,0,0,0,0,0,3,3,0],
  [0,3,3,1,1,1,1,1,3,3,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,2,2,2,2,2,2,1,0,0],
  [0,0,1,5,4,1,1,5,4,1,0,0],
];

// --- GETTING UP (from lying down to standing) ---
export const GETUP_1: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0],
  [0,0,0,0,0,0,0,1,1,1,0,0],
  [0,0,0,0,0,0,1,4,5,1,0,0],
  [0,0,0,0,0,0,1,1,3,1,0,0],
  [0,3,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,2,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,0,0,0,0,0],
  [0,0,0,3,3,3,3,0,0,0,0,0],
];

export const GETUP_2: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [1,1,1,2,2,2,2,2,2,1,1,1],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

// --- POKED (startled jump) ---
export const POKED_1: SpriteFrame = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,4,5,1,1,5,4,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [1,1,1,1,2,2,2,2,1,1,1,1],
  [1,0,1,2,2,2,2,2,2,1,0,1],
  [0,0,1,2,2,2,2,2,2,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
];

// Animation definitions: state -> array of frames with timing
export interface AnimationDef {
  frames: SpriteFrame[];
  frameDuration: number; // ms per frame
  loop: boolean;
  next?: PenguinState; // state to transition to when done (if not looping)
}

export type PenguinState =
  | "idle"
  | "idle-look"
  | "idle-yawn"
  | "idle-shuffle"
  | "falling"
  | "landing"
  | "tumble"
  | "getting-up"
  | "poked";

export const ANIMATIONS: Record<PenguinState, AnimationDef> = {
  idle: {
    frames: [IDLE_1, IDLE_2],
    frameDuration: 600,
    loop: true,
  },
  "idle-look": {
    frames: [LOOK_LEFT, IDLE_1, LOOK_RIGHT],
    frameDuration: 500,
    loop: false,
    next: "idle",
  },
  "idle-yawn": {
    frames: [IDLE_1, YAWN_1, YAWN_1, IDLE_1],
    frameDuration: 400,
    loop: false,
    next: "idle",
  },
  "idle-shuffle": {
    frames: [SHUFFLE_LEFT, IDLE_1, SHUFFLE_RIGHT],
    frameDuration: 300,
    loop: false,
    next: "idle",
  },
  falling: {
    frames: [FALLING_1, FALLING_2],
    frameDuration: 150,
    loop: true,
  },
  landing: {
    frames: [LANDING_1, LANDING_2, IDLE_1],
    frameDuration: 150,
    loop: false,
    next: "idle",
  },
  tumble: {
    frames: [TUMBLE_1, TUMBLE_2],
    frameDuration: 200,
    loop: false,
    next: "getting-up",
  },
  "getting-up": {
    frames: [TUMBLE_2, GETUP_1, GETUP_2, IDLE_1],
    frameDuration: 250,
    loop: false,
    next: "idle",
  },
  poked: {
    frames: [POKED_1, IDLE_2, IDLE_1],
    frameDuration: 200,
    loop: false,
    next: "idle",
  },
};

// Sprite grid dimensions
export const SPRITE_WIDTH = 12;
export const SPRITE_HEIGHT = 16;
// Scale factor: each pixel = 4 canvas pixels = 48x64 rendered
export const PIXEL_SCALE = 4;
```

**Step 2: Verify the file compiles**

Run: `cd next-app && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to sprites.ts

**Step 3: Commit**

```bash
git add next-app/components/penguin/sprites.ts
git commit -m "feat: add penguin pixel art sprite data and animation definitions"
```

---

### Task 2: Create PenguinCompanion Canvas Component (rendering only)

**Files:**
- Create: `next-app/components/penguin/PenguinCompanion.tsx`

**Context:** Follow the EmberCanvas pattern: `useRef` for canvas/animation frame, `useEffect` for setup + RAF loop, DPR-aware canvas sizing. The component renders a fixed-position canvas and draws the current sprite frame pixel by pixel.

**Step 1: Create the component with canvas setup and sprite rendering**

Create `next-app/components/penguin/PenguinCompanion.tsx`:

```typescript
"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  PENGUIN_PALETTE,
  ANIMATIONS,
  PIXEL_SCALE,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  type PenguinState,
  type SpriteFrame,
} from "./sprites";

// Canvas size with padding for jump animations
const CANVAS_W = SPRITE_WIDTH * PIXEL_SCALE + 16; // 64
const CANVAS_H = SPRITE_HEIGHT * PIXEL_SCALE + 32; // 96 (extra top space for jumps)

// Physics constants
const GRAVITY = 0.6;
const TERMINAL_VELOCITY = 12;
const BOUNCE_FACTOR = 0.3;
const SCROLL_UP_TUMBLE_THRESHOLD = 30; // px/frame delta to trigger tumble

// Idle timer thresholds (ms)
const IDLE_LOOK_DELAY = 5000;
const IDLE_SHUFFLE_DELAY = 7000;
const IDLE_YAWN_DELAY = 10000;

interface PenguinPhysics {
  yOffset: number;    // vertical offset from floor (0 = on floor, positive = above)
  velocity: number;   // vertical velocity (positive = downward)
  isFalling: boolean;
}

export function PenguinCompanion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // State refs (mutable, not triggering re-renders)
  const stateRef = useRef<PenguinState>("idle");
  const frameIndexRef = useRef(0);
  const frameTimerRef = useRef(0);
  const lastTimeRef = useRef(0);
  const physicsRef = useRef<PenguinPhysics>({
    yOffset: 0,
    velocity: 0,
    isFalling: false,
  });

  // Scroll tracking
  const lastScrollYRef = useRef(0);
  const scrollDeltaRef = useRef(0);
  const scrollIdleTimerRef = useRef(0);

  // Idle animation timer
  const idleTimerRef = useRef(0);

  const setState = useCallback((newState: PenguinState) => {
    if (stateRef.current === newState) return;
    stateRef.current = newState;
    frameIndexRef.current = 0;
    frameTimerRef.current = 0;
    idleTimerRef.current = 0;
  }, []);

  const drawSprite = useCallback(
    (ctx: CanvasRenderingContext2D, frame: SpriteFrame, yOffset: number) => {
      const offsetX = 8; // horizontal padding
      const baseY = CANVAS_H - SPRITE_HEIGHT * PIXEL_SCALE - 8; // floor position
      const drawY = baseY - yOffset;

      for (let row = 0; row < frame.length; row++) {
        for (let col = 0; col < frame[row].length; col++) {
          const colorIdx = frame[row][col];
          if (colorIdx === 0) continue; // transparent
          const color = PENGUIN_PALETTE[colorIdx];
          ctx.fillStyle = color;
          ctx.fillRect(
            offsetX + col * PIXEL_SCALE,
            drawY + row * PIXEL_SCALE,
            PIXEL_SCALE,
            PIXEL_SCALE
          );
        }
      }
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // DPR setup
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    ctx.scale(dpr, dpr);

    // Disable image smoothing for crisp pixels
    ctx.imageSmoothingEnabled = false;

    lastScrollYRef.current = window.scrollY;
    lastTimeRef.current = performance.now();

    // Scroll handler
    const handleScroll = () => {
      const currentY = window.scrollY;
      scrollDeltaRef.current = currentY - lastScrollYRef.current;
      lastScrollYRef.current = currentY;
      scrollIdleTimerRef.current = 0;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Click handler
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Check if click is within the penguin area
      if (
        x >= 0 && x <= CANVAS_W &&
        y >= 0 && y <= CANVAS_H &&
        stateRef.current !== "falling" &&
        stateRef.current !== "tumble"
      ) {
        setState("poked");
        // Give a little upward velocity for the jump
        physicsRef.current.yOffset = 0;
        physicsRef.current.velocity = -6;
        physicsRef.current.isFalling = true;
      }
    };
    canvas.addEventListener("click", handleClick);

    // Animation loop
    const animate = (now: number) => {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const state = stateRef.current;
      const anim = ANIMATIONS[state];
      const physics = physicsRef.current;

      // --- Frame advancement ---
      frameTimerRef.current += dt;
      if (frameTimerRef.current >= anim.frameDuration) {
        frameTimerRef.current -= anim.frameDuration;
        frameIndexRef.current++;

        if (frameIndexRef.current >= anim.frames.length) {
          if (anim.loop) {
            frameIndexRef.current = 0;
          } else {
            // Transition to next state
            frameIndexRef.current = anim.frames.length - 1;
            if (anim.next) {
              setState(anim.next);
            }
          }
        }
      }

      // --- Scroll-driven state transitions ---
      const delta = scrollDeltaRef.current;
      scrollIdleTimerRef.current += dt;

      if (delta > 2 && state !== "tumble" && state !== "getting-up") {
        // Scrolling down -> falling
        if (state !== "falling") setState("falling");
        physics.isFalling = true;
        physics.velocity += GRAVITY;
        if (physics.velocity > TERMINAL_VELOCITY)
          physics.velocity = TERMINAL_VELOCITY;
        physics.yOffset = Math.max(0, physics.yOffset - physics.velocity);
      } else if (
        delta < -SCROLL_UP_TUMBLE_THRESHOLD &&
        state !== "tumble" &&
        state !== "getting-up" &&
        state !== "poked"
      ) {
        // Scrolling up fast -> tumble
        setState("tumble");
        physics.yOffset = 0;
        physics.velocity = 0;
        physics.isFalling = false;
      } else if (
        scrollIdleTimerRef.current > 100 &&
        physics.isFalling
      ) {
        // Scroll stopped after falling -> landing
        if (physics.yOffset > 0) {
          // Still in the air, apply gravity to bring down
          physics.velocity += GRAVITY;
          physics.yOffset -= physics.velocity;
          if (physics.yOffset <= 0) {
            physics.yOffset = 0;
            physics.velocity = 0;
            physics.isFalling = false;
            if (state === "falling") setState("landing");
          }
        } else {
          // On the ground
          if (state === "falling") setState("landing");
          physics.isFalling = false;
          physics.velocity = 0;
        }
      }

      // Poke physics (jump arc)
      if (state === "poked" && physics.isFalling) {
        physics.velocity += GRAVITY;
        physics.yOffset -= physics.velocity;
        if (physics.yOffset <= 0) {
          physics.yOffset = 0;
          physics.velocity = 0;
          physics.isFalling = false;
        }
      }

      // Reset scroll delta (consumed)
      scrollDeltaRef.current = 0;

      // --- Idle timer ---
      if (state === "idle") {
        idleTimerRef.current += dt;
        if (idleTimerRef.current > IDLE_YAWN_DELAY && Math.random() < 0.01) {
          setState("idle-yawn");
        } else if (
          idleTimerRef.current > IDLE_SHUFFLE_DELAY &&
          Math.random() < 0.008
        ) {
          setState("idle-shuffle");
        } else if (
          idleTimerRef.current > IDLE_LOOK_DELAY &&
          Math.random() < 0.01
        ) {
          setState("idle-look");
        }
      }

      // --- Draw ---
      const frame = anim.frames[frameIndexRef.current] ?? anim.frames[0];
      drawSprite(ctx, frame, physics.yOffset);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("scroll", handleScroll);
      canvas.removeEventListener("click", handleClick);
    };
  }, [setState, drawSprite]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed bottom-4 left-6 z-30 hidden md:block cursor-pointer"
      style={{ imageRendering: "pixelated" }}
      aria-label="Interactive penguin companion"
      role="img"
    />
  );
}
```

**Step 2: Create barrel export**

Create `next-app/components/penguin/index.ts`:

```typescript
export { PenguinCompanion } from "./PenguinCompanion";
```

**Step 3: Verify compilation**

Run: `cd next-app && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 4: Commit**

```bash
git add next-app/components/penguin/PenguinCompanion.tsx next-app/components/penguin/index.ts
git commit -m "feat: add PenguinCompanion canvas component with physics and state machine"
```

---

### Task 3: Integrate into PageClient

**Files:**
- Modify: `next-app/components/PageClient.tsx`

**Step 1: Add the PenguinCompanion to PageClient**

In `next-app/components/PageClient.tsx`, add the import and render the component between EmberCanvas and main:

Add import:
```typescript
import { PenguinCompanion } from "./penguin";
```

Add component after `<EmberCanvas>` line:
```typescript
<PenguinCompanion />
```

The result should look like:
```typescript
<EmberCanvas className="fixed inset-0 z-0" />
<PenguinCompanion />
<main className="relative z-10">
```

**Step 2: Verify compilation**

Run: `cd next-app && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Visual verification**

Run: `cd next-app && npm run dev`
Expected: Penguin appears in bottom-left on desktop viewport. Should animate idle breathing. Scroll down to test falling. Scroll up fast to test tumble. Click to test poke.

**Step 4: Commit**

```bash
git add next-app/components/PageClient.tsx
git commit -m "feat: integrate PenguinCompanion into page layout"
```

---

### Task 4: Polish and Tuning

**Files:**
- Modify: `next-app/components/penguin/PenguinCompanion.tsx`
- Modify: `next-app/components/penguin/sprites.ts`

**Step 1: Visual testing and sprite tuning**

Run the dev server and test each animation state:

1. **Idle breathing** - Does the 2-frame loop look smooth at 600ms?
2. **Idle look/shuffle/yawn** - Do they trigger after waiting? Adjust timer thresholds if too fast/slow.
3. **Scroll down** - Does penguin enter falling state? Does it land with squish when scroll stops?
4. **Scroll up fast** - Does tumble trigger? Does getting-up play correctly?
5. **Click** - Does poke jump feel responsive?

Adjust any sprite pixel data, timing values, or physics constants based on visual testing. Key tuning params:
- `GRAVITY` (0.6) -- controls fall speed
- `TERMINAL_VELOCITY` (12) -- max fall speed
- `SCROLL_UP_TUMBLE_THRESHOLD` (30) -- sensitivity to scroll-up tumble trigger
- `frameDuration` per animation -- speed of frame cycling
- `idleTimerRef` thresholds and probability values

**Step 2: Lint check**

Run: `cd next-app && npx next lint 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: polish penguin animations and physics tuning"
```
