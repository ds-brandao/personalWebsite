# Penguin V2 Living Character Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the static corner penguin into a living character that explores the page, walks on surfaces, and performs mischievous actions.

**Architecture:** The existing small fixed canvas becomes a full-viewport overlay. A waypoint system maps walkable surfaces on page elements. A behavior tree drives autonomous decisions. The penguin moves in page coordinates with walking, jumping, and falling physics. New sprite frames cover 10 additional animation states.

**Tech Stack:** React 19, Canvas API, TypeScript. No new dependencies.

---

### Task 1: Add New Sprite Frames to sprites.ts

**Files:**
- Modify: `next-app/components/penguin/sprites.ts`

**Context:** The existing file has 16 sprite frames across 9 animation states. We need to add ~29 new frames for 10 new states, expand the `PenguinState` type, and add entries to the `ANIMATIONS` record. Walk-left reuses walk-right frames with a `flipH` flag on the animation definition.

**Step 1: Add `flipH` to AnimationDef and update PenguinState**

In `sprites.ts`, update the `AnimationDef` interface to add a `flipH` optional boolean:

```typescript
export interface AnimationDef {
  frames: SpriteFrame[];
  frameDuration: number;
  loop: boolean;
  next?: PenguinState;
  flipH?: boolean; // mirror sprites horizontally when rendering
}
```

Expand the `PenguinState` type to include the new states:

```typescript
export type PenguinState =
  | "idle"
  | "idle-look"
  | "idle-yawn"
  | "idle-shuffle"
  | "falling"
  | "landing"
  | "tumble"
  | "getting-up"
  | "poked"
  | "walk-right"
  | "walk-left"
  | "jump"
  | "belly-slide"
  | "sit"
  | "nap"
  | "dance"
  | "peck"
  | "trip"
  | "push";
```

**Step 2: Add walk sprite frames**

Add after the POKED_1 definition. Walk cycle is 4 frames showing a waddle (feet alternating, body bobbing slightly):

```typescript
// --- WALK (4-frame waddle cycle, right-facing) ---
export const WALK_1: SpriteFrame = [
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
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,3,3,3,3,0,0,0],
  [0,0,0,0,0,0,3,0,3,3,0,0],
];

export const WALK_2: SpriteFrame = [
  [0,0,0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,4,5,1,1,4,5,1,0],
  [0,0,0,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,1,1,3,3,1,1,1,0],
  [0,0,1,1,1,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,2,1,1,0],
  [0,0,0,1,1,2,2,2,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,0,0],
  [0,0,0,0,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,0],
  [0,0,0,0,3,3,0,3,3,0,0,0],
  [0,0,0,3,3,0,0,0,3,3,0,0],
];

export const WALK_3: SpriteFrame = [
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
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,3,3,3,0,0,0,0,0,0],
  [0,0,3,3,0,3,0,0,0,0,0,0],
];

export const WALK_4: SpriteFrame = [
  [0,0,0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,4,5,1,1,4,5,1,0],
  [0,0,0,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,1,1,3,3,1,1,1,0],
  [0,0,1,1,1,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,2,1,1,0],
  [0,0,0,1,1,2,2,2,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,0,0],
  [0,0,0,0,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,0],
  [0,0,0,0,3,3,0,3,3,0,0,0],
  [0,0,0,3,3,0,0,0,3,3,0,0],
];
```

**Step 3: Add jump, belly-slide, sit, nap, dance, peck, trip, push frames**

```typescript
// --- JUMP (2 frames: launch + airborne) ---
export const JUMP_1: SpriteFrame = [
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
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
];

export const JUMP_2: SpriteFrame = [
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
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
];

// --- BELLY SLIDE (2 frames: sliding on belly) ---
export const BELLY_1: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0],
  [0,0,0,0,0,0,0,0,1,1,1,0],
  [0,0,0,0,0,0,0,1,4,5,1,0],
  [3,3,0,0,0,0,0,1,1,3,1,0],
  [0,3,1,1,1,1,1,1,1,1,1,0],
  [0,0,1,2,2,2,2,2,2,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
];

export const BELLY_2: SpriteFrame = [
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
  [0,0,0,0,0,0,0,0,1,4,5,1],
  [0,3,3,0,0,0,0,0,1,1,3,1],
  [0,0,3,1,1,1,1,1,1,1,1,0],
  [0,0,1,2,2,2,2,2,2,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
];

// --- SIT (2 frames: lowering down, seated) ---
export const SIT_1: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,1,1,1,2,2,2,2,1,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,3,3,1,1,1,1,3,3,0,0],
  [0,0,3,3,0,0,0,0,3,3,0,0],
];

export const SIT_2: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,1,1,1,2,2,2,2,1,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,3,3,1,1,1,1,3,3,0,0],
  [0,0,3,3,0,0,0,0,3,3,0,0],
];

// --- NAP (3 frames: lying down with zzz) ---
export const NAP_1: SpriteFrame = [
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
  [0,0,1,1,1,1,1,1,1,1,0,0],
];

export const NAP_2: SpriteFrame = [
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
  [0,0,1,1,1,1,1,1,1,1,0,0],
];

export const NAP_3: SpriteFrame = [
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
  [0,0,1,1,1,1,1,1,1,1,0,0],
];

// --- DANCE (4 frames: happy wiggle) ---
export const DANCE_1: SpriteFrame = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [1,1,1,1,2,2,2,2,1,1,0,0],
  [1,0,1,2,2,2,2,2,1,1,0,0],
  [0,0,1,2,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

export const DANCE_2: SpriteFrame = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,1,1],
  [0,0,1,1,2,2,2,2,2,1,0,1],
  [0,0,1,1,2,2,2,2,2,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

export const DANCE_3: SpriteFrame = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,5,4,1,1,5,4,1,0,0],
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
  [0,0,0,0,3,0,0,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

export const DANCE_4: SpriteFrame = [
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
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,3,0,0,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

// --- PECK (3 frames: head dips down) ---
export const PECK_1: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,2,2,2,2,1,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

export const PECK_2: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,1,1,1,2,3,3,2,1,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

export const PECK_3: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,4,5,1,1,4,5,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,3,3,1,1,1,0,0],
  [0,1,1,1,2,2,2,2,1,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,1,1,2,2,2,2,2,2,1,1,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

// --- TRIP (2 frames: stumble at edge) ---
export const TRIP_1: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,4,5,1,1,4,5,1,0],
  [0,0,0,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,1,1,3,3,1,1,1,0],
  [0,0,1,1,2,2,2,2,1,1,1,0],
  [0,0,1,2,2,2,2,2,1,1,0,0],
  [0,0,1,1,2,2,2,1,1,0,0,0],
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,0,0,0,0],
  [0,0,0,0,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,3,3,3,0,0,0,0,0],
  [0,0,0,3,3,0,3,3,0,0,0,0],
];

export const TRIP_2: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0],
  [0,0,0,0,1,1,1,1,1,1,1,1],
  [0,0,0,0,1,4,5,1,1,4,5,1],
  [0,0,0,0,1,1,1,1,1,1,1,1],
  [0,0,0,0,1,1,1,3,3,1,1,0],
  [0,0,0,1,1,2,2,2,2,1,0,0],
  [0,0,0,1,2,2,2,2,1,1,0,0],
  [0,0,0,1,1,2,2,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,0,3,3,0,0,0,0,0],
  [0,0,0,0,3,3,0,0,0,0,0,0],
  [0,0,0,3,3,0,0,0,0,0,0,0],
];

// --- PUSH (3 frames: pushing against something) ---
export const PUSH_1: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,4,5,1,1,4,5,1,0],
  [0,0,0,1,1,1,1,1,1,1,1,0],
  [0,0,0,1,1,1,3,3,1,1,1,0],
  [0,0,1,1,1,2,2,2,2,1,1,1],
  [0,0,1,1,2,2,2,2,2,1,1,1],
  [0,0,1,1,2,2,2,2,2,1,1,1],
  [0,0,0,1,1,2,2,2,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,0,0],
  [0,0,0,0,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

export const PUSH_2: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0],
  [0,0,0,0,1,1,1,1,1,1,1,1],
  [0,0,0,0,1,4,5,1,1,4,5,1],
  [0,0,0,0,1,1,1,1,1,1,1,1],
  [0,0,0,0,1,1,1,3,3,1,1,1],
  [0,0,0,1,1,2,2,2,2,1,1,1],
  [0,0,1,1,2,2,2,2,2,1,1,1],
  [0,0,1,1,2,2,2,2,2,1,1,1],
  [0,0,0,1,1,2,2,2,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,3,3,0,0,3,3,0,0,0],
];

export const PUSH_3: SpriteFrame = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,0],
  [0,0,0,0,0,0,1,1,1,1,1,1],
  [0,0,0,0,0,1,1,1,1,1,1,1],
  [0,0,0,0,0,1,4,5,1,4,5,1],
  [0,0,0,0,0,1,1,1,1,1,1,1],
  [0,0,0,0,0,1,1,3,3,1,1,1],
  [0,0,0,0,1,1,2,2,2,1,1,1],
  [0,0,0,1,1,2,2,2,2,1,1,1],
  [0,0,1,1,2,2,2,2,2,1,1,1],
  [0,0,0,1,1,2,2,2,1,1,0,0],
  [0,0,0,0,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,0],
  [0,0,0,0,0,0,1,1,0,0,0,0],
  [0,0,0,0,0,3,3,3,0,0,0,0],
  [0,0,0,0,3,3,0,3,3,0,0,0],
];
```

**Step 4: Add new animation definitions to the ANIMATIONS record**

Append to the ANIMATIONS record after the existing `poked` entry:

```typescript
  "walk-right": {
    frames: [WALK_1, WALK_2, WALK_3, WALK_4],
    frameDuration: 150,
    loop: true,
  },
  "walk-left": {
    frames: [WALK_1, WALK_2, WALK_3, WALK_4],
    frameDuration: 150,
    loop: true,
    flipH: true,
  },
  jump: {
    frames: [JUMP_1, JUMP_2],
    frameDuration: 200,
    loop: false,
    next: "falling",
  },
  "belly-slide": {
    frames: [BELLY_1, BELLY_2],
    frameDuration: 100,
    loop: true,
  },
  sit: {
    frames: [SIT_1, SIT_2],
    frameDuration: 500,
    loop: false,
  },
  nap: {
    frames: [NAP_1, NAP_2, NAP_3],
    frameDuration: 800,
    loop: true,
  },
  dance: {
    frames: [DANCE_1, DANCE_2, DANCE_3, DANCE_4],
    frameDuration: 200,
    loop: true,
  },
  peck: {
    frames: [PECK_1, PECK_2, PECK_3],
    frameDuration: 200,
    loop: false,
    next: "idle",
  },
  trip: {
    frames: [TRIP_1, TRIP_2],
    frameDuration: 200,
    loop: false,
    next: "falling",
  },
  push: {
    frames: [PUSH_1, PUSH_2, PUSH_3],
    frameDuration: 250,
    loop: false,
    next: "idle",
  },
```

**Step 5: Verify compilation**

Run: `cd next-app && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 6: Commit**

```bash
git add next-app/components/penguin/sprites.ts
git commit -m "feat: add 10 new penguin animation states with sprite frames"
```

---

### Task 2: Create Waypoint System

**Files:**
- Create: `next-app/components/penguin/waypoints.ts`

**Context:** Waypoints are named positions on the page where the penguin can stand. Each waypoint queries a DOM element for its current position (so it handles layout changes). Connections define which waypoints are reachable from each other. The penguin uses these to navigate the page.

**Step 1: Create the waypoint system**

Create `next-app/components/penguin/waypoints.ts`:

```typescript
export type PenguinAction =
  | "idle"
  | "dance"
  | "belly-slide"
  | "sit"
  | "nap"
  | "peck"
  | "push";

export interface Waypoint {
  id: string;
  getRect: () => { x: number; y: number; width: number } | null;
  actions: PenguinAction[];
  connections: string[];
}

function queryElement(selector: string): { x: number; y: number; width: number } | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    width: rect.width,
  };
}

// Static waypoints defined by page structure
export function getWaypoints(): Waypoint[] {
  return [
    {
      id: "ground",
      getRect: () => ({
        x: 0,
        y: document.documentElement.scrollHeight,
        width: window.innerWidth,
      }),
      actions: ["idle", "dance"],
      connections: ["footer-top"],
    },
    {
      id: "hero-floor",
      getRect: () => {
        const r = queryElement("#hero");
        return r ? { x: r.x, y: r.y + (window.innerHeight), width: r.width } : null;
      },
      actions: ["idle", "dance", "belly-slide"],
      connections: ["articles-top", "ground"],
    },
    {
      id: "articles-top",
      getRect: () => queryElement("#articles"),
      actions: ["idle", "peck"],
      connections: ["hero-floor", "projects-top", "footer-top"],
    },
    {
      id: "projects-top",
      getRect: () => queryElement("#projects"),
      actions: ["idle", "peck"],
      connections: ["articles-top", "footer-top"],
    },
    {
      id: "footer-top",
      getRect: () => queryElement("footer"),
      actions: ["idle", "nap", "sit", "dance"],
      connections: ["projects-top", "ground"],
    },
  ];
}

// Dynamically find article cards and add them as waypoints
export function getCardWaypoints(): Waypoint[] {
  const waypoints: Waypoint[] = [];

  // Article cards (bento grid items)
  const articleCards = document.querySelectorAll("#articles .grid > div");
  articleCards.forEach((el, i) => {
    const id = `card-${i}`;
    waypoints.push({
      id,
      getRect: () => {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: rect.width,
        };
      },
      actions: ["sit", "nap", "peck", "belly-slide"],
      connections: [
        `card-${i - 1}`,
        `card-${i + 1}`,
        "articles-top",
      ].filter((c) => !c.includes("-1")),
    });
  });

  // Project cards (horizontal scroll items)
  const projectCards = document.querySelectorAll("#projects .flex > div");
  projectCards.forEach((el, i) => {
    const id = `project-${i}`;
    waypoints.push({
      id,
      getRect: () => {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: rect.width,
        };
      },
      actions: ["sit", "push", "belly-slide"],
      connections: [
        `project-${i - 1}`,
        `project-${i + 1}`,
        "projects-top",
      ].filter((c) => !c.includes("--1")),
    });
  });

  return waypoints;
}

export interface ResolvedWaypoint {
  id: string;
  x: number;
  y: number;
  width: number;
  actions: PenguinAction[];
  connections: string[];
}

// Resolve all waypoints to current positions
export function resolveWaypoints(): ResolvedWaypoint[] {
  const all = [...getWaypoints(), ...getCardWaypoints()];
  const resolved: ResolvedWaypoint[] = [];

  for (const wp of all) {
    const rect = wp.getRect();
    if (rect) {
      resolved.push({
        id: wp.id,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        actions: wp.actions,
        connections: wp.connections,
      });
    }
  }

  return resolved;
}

// Find a waypoint by ID
export function findWaypoint(
  waypoints: ResolvedWaypoint[],
  id: string
): ResolvedWaypoint | undefined {
  return waypoints.find((wp) => wp.id === id);
}
```

**Step 2: Verify compilation**

Run: `cd next-app && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add next-app/components/penguin/waypoints.ts
git commit -m "feat: add penguin waypoint system for page navigation"
```

---

### Task 3: Create Behavior Tree

**Files:**
- Create: `next-app/components/penguin/behavior.ts`

**Context:** The behavior tree decides what the penguin does next. It picks from contextual actions at the current waypoint, movement to connected waypoints, or idle animations. It runs on a timer (every 3-8 seconds) and returns a decision the main loop executes.

**Step 1: Create the behavior engine**

Create `next-app/components/penguin/behavior.ts`:

```typescript
import type { PenguinState } from "./sprites";
import type { ResolvedWaypoint, PenguinAction } from "./waypoints";

export type BehaviorDecision =
  | { type: "action"; state: PenguinState; duration: number }
  | { type: "move"; targetWaypointId: string }
  | { type: "idle" };

const ACTION_TO_STATE: Record<PenguinAction, PenguinState> = {
  idle: "idle",
  dance: "dance",
  "belly-slide": "belly-slide",
  sit: "sit",
  nap: "nap",
  peck: "peck",
  push: "push",
};

const ACTION_DURATIONS: Record<PenguinAction, number> = {
  idle: 3000,
  dance: 4000,
  "belly-slide": 2000,
  sit: 5000,
  nap: 8000,
  peck: 1500,
  push: 2000,
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function decideBehavior(
  currentWaypoint: ResolvedWaypoint | null,
  allWaypoints: ResolvedWaypoint[],
  justArrived: boolean
): BehaviorDecision {
  if (!currentWaypoint) {
    // Not on any waypoint -- idle until we land somewhere
    return { type: "idle" };
  }

  const roll = Math.random();

  if (justArrived) {
    // Just arrived at a waypoint
    if (roll < 0.6 && currentWaypoint.actions.length > 0) {
      // Do a contextual action
      const action = pickRandom(currentWaypoint.actions);
      return {
        type: "action",
        state: ACTION_TO_STATE[action],
        duration: ACTION_DURATIONS[action],
      };
    } else {
      // Pick another destination
      const reachable = currentWaypoint.connections
        .map((id) => allWaypoints.find((wp) => wp.id === id))
        .filter((wp): wp is ResolvedWaypoint => wp != null);
      if (reachable.length > 0) {
        return { type: "move", targetWaypointId: pickRandom(reachable).id };
      }
      return { type: "idle" };
    }
  }

  // Regular decision at current waypoint
  if (roll < 0.4 && currentWaypoint.actions.length > 0) {
    const action = pickRandom(currentWaypoint.actions);
    return {
      type: "action",
      state: ACTION_TO_STATE[action],
      duration: ACTION_DURATIONS[action],
    };
  } else if (roll < 0.7) {
    // Walk to a connected waypoint
    const reachable = currentWaypoint.connections
      .map((id) => allWaypoints.find((wp) => wp.id === id))
      .filter((wp): wp is ResolvedWaypoint => wp != null);
    if (reachable.length > 0) {
      return { type: "move", targetWaypointId: pickRandom(reachable).id };
    }
    return { type: "idle" };
  } else if (roll < 0.9) {
    // Belly slide
    if (currentWaypoint.actions.includes("belly-slide")) {
      return {
        type: "action",
        state: "belly-slide",
        duration: 2000,
      };
    }
    return { type: "idle" };
  } else {
    // Idle animation
    const idleStates: PenguinState[] = ["idle-look", "idle-yawn", "idle-shuffle"];
    return {
      type: "action",
      state: pickRandom(idleStates),
      duration: 2000,
    };
  }
}

// How long to wait between behavior decisions (ms)
export function nextDecisionDelay(): number {
  return randomBetween(3000, 8000);
}
```

**Step 2: Verify compilation**

Run: `cd next-app && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add next-app/components/penguin/behavior.ts
git commit -m "feat: add penguin behavior tree for autonomous decisions"
```

---

### Task 4: Rewrite PenguinCompanion Component

**Files:**
- Rewrite: `next-app/components/penguin/PenguinCompanion.tsx`

**Context:** This is the major rewrite. The component switches from a small fixed canvas to a full-viewport overlay. The penguin now has world-space (x, y) coordinates, walks between waypoints, and uses the behavior tree for decisions. Scroll reactions are preserved. The renderer draws the sprite at the correct viewport position accounting for scroll offset. Horizontal flipping is done via canvas transform for left-facing movement.

**Step 1: Rewrite PenguinCompanion.tsx**

Replace the entire contents of `next-app/components/penguin/PenguinCompanion.tsx` with:

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
import { resolveWaypoints, findWaypoint, type ResolvedWaypoint } from "./waypoints";
import { decideBehavior, nextDecisionDelay } from "./behavior";

const PENGUIN_W = SPRITE_WIDTH * PIXEL_SCALE;
const PENGUIN_H = SPRITE_HEIGHT * PIXEL_SCALE;

// Physics
const GRAVITY = 0.8;
const TERMINAL_VELOCITY = 14;
const WALK_SPEED = 1.5;
const JUMP_VX = 3;
const JUMP_VY = -10;
const SCROLL_TUMBLE_THRESHOLD = 40;

interface PenguinWorld {
  x: number; // page-space x
  y: number; // page-space y (top of penguin)
  vx: number;
  vy: number;
  onSurface: boolean;
  facingRight: boolean;
  currentWaypointId: string | null;
  targetWaypointId: string | null;
  targetX: number | null;
}

export function PenguinCompanion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Penguin state
  const stateRef = useRef<PenguinState>("idle");
  const frameIndexRef = useRef(0);
  const frameTimerRef = useRef(0);
  const lastTimeRef = useRef(0);
  const worldRef = useRef<PenguinWorld>({
    x: 100,
    y: 0,
    vx: 0,
    vy: 0,
    onSurface: false,
    facingRight: true,
    currentWaypointId: "ground",
    targetWaypointId: null,
    targetX: null,
  });

  // Behavior timer
  const behaviorTimerRef = useRef(0);
  const behaviorDelayRef = useRef(nextDecisionDelay());
  const actionTimerRef = useRef(0);
  const actionDurationRef = useRef(0);
  const justArrivedRef = useRef(true);

  // Waypoints cache (refreshed periodically)
  const waypointsRef = useRef<ResolvedWaypoint[]>([]);
  const waypointRefreshRef = useRef(0);

  // Scroll tracking
  const lastScrollYRef = useRef(0);
  const scrollDeltaRef = useRef(0);

  const setState = useCallback((newState: PenguinState) => {
    if (stateRef.current === newState) return;
    stateRef.current = newState;
    frameIndexRef.current = 0;
    frameTimerRef.current = 0;
  }, []);

  const drawSprite = useCallback(
    (ctx: CanvasRenderingContext2D, frame: SpriteFrame, screenX: number, screenY: number, flipH: boolean) => {
      ctx.save();
      if (flipH) {
        ctx.translate(screenX + PENGUIN_W, screenY);
        ctx.scale(-1, 1);
        ctx.translate(0, 0);
      } else {
        ctx.translate(screenX, screenY);
      }

      for (let row = 0; row < frame.length; row++) {
        for (let col = 0; col < frame[row].length; col++) {
          const colorIdx = frame[row][col];
          if (colorIdx === 0) continue;
          ctx.fillStyle = PENGUIN_PALETTE[colorIdx];
          ctx.fillRect(
            col * PIXEL_SCALE,
            row * PIXEL_SCALE,
            PIXEL_SCALE,
            PIXEL_SCALE
          );
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

    // Initial position: bottom of first visible section
    const initY = document.documentElement.scrollHeight - PENGUIN_H;
    worldRef.current.y = initY;
    worldRef.current.x = 100;
    lastScrollYRef.current = window.scrollY;
    lastTimeRef.current = performance.now();

    // Scroll handler
    const handleScroll = () => {
      const currentY = window.scrollY;
      scrollDeltaRef.current += currentY - lastScrollYRef.current;
      lastScrollYRef.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Click handler (hit-test on penguin position)
    const handleClick = (e: MouseEvent) => {
      const world = worldRef.current;
      const screenX = world.x - window.scrollX;
      const screenY = world.y - window.scrollY;
      const mx = e.clientX;
      const my = e.clientY;

      if (
        mx >= screenX && mx <= screenX + PENGUIN_W &&
        my >= screenY && my <= screenY + PENGUIN_H &&
        stateRef.current !== "tumble" &&
        stateRef.current !== "getting-up"
      ) {
        setState("poked");
        world.vy = -8;
        world.onSurface = false;
        world.targetWaypointId = null;
        world.targetX = null;
        actionTimerRef.current = 0;
        actionDurationRef.current = 0;
      }
    };
    window.addEventListener("click", handleClick);

    const animate = (now: number) => {
      const dt = Math.min(now - lastTimeRef.current, 50); // cap at 50ms
      lastTimeRef.current = now;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const state = stateRef.current;
      const anim = ANIMATIONS[state];
      const world = worldRef.current;

      // --- Refresh waypoints every 2 seconds ---
      waypointRefreshRef.current += dt;
      if (waypointRefreshRef.current > 2000) {
        waypointsRef.current = resolveWaypoints();
        waypointRefreshRef.current = 0;
      }
      const waypoints = waypointsRef.current;

      // --- Frame advancement ---
      frameTimerRef.current += dt;
      if (frameTimerRef.current >= anim.frameDuration) {
        frameTimerRef.current -= anim.frameDuration;
        frameIndexRef.current++;
        if (frameIndexRef.current >= anim.frames.length) {
          if (anim.loop) {
            frameIndexRef.current = 0;
          } else {
            frameIndexRef.current = anim.frames.length - 1;
            if (anim.next) setState(anim.next);
          }
        }
      }

      // --- Scroll reactions ---
      const scrollDelta = scrollDeltaRef.current;
      scrollDeltaRef.current = 0;
      if (
        scrollDelta < -SCROLL_TUMBLE_THRESHOLD &&
        state !== "tumble" &&
        state !== "getting-up" &&
        state !== "poked"
      ) {
        setState("tumble");
        world.targetWaypointId = null;
        world.targetX = null;
        actionTimerRef.current = 0;
        actionDurationRef.current = 0;
      }

      // --- Physics ---
      if (!world.onSurface) {
        world.vy += GRAVITY;
        if (world.vy > TERMINAL_VELOCITY) world.vy = TERMINAL_VELOCITY;
      }
      world.x += world.vx;
      world.y += world.vy;

      // Floor collision (page bottom)
      const pageBottom = document.documentElement.scrollHeight - PENGUIN_H;
      if (world.y >= pageBottom) {
        world.y = pageBottom;
        if (world.vy > 2) {
          setState("landing");
        }
        world.vy = 0;
        world.vx = 0;
        world.onSurface = true;
      }

      // Surface collision with waypoints
      if (!world.onSurface && world.vy > 0) {
        for (const wp of waypoints) {
          if (
            world.x + PENGUIN_W > wp.x &&
            world.x < wp.x + wp.width &&
            world.y + PENGUIN_H >= wp.y &&
            world.y + PENGUIN_H - world.vy < wp.y
          ) {
            // Landed on this waypoint
            world.y = wp.y - PENGUIN_H;
            world.vy = 0;
            world.vx = 0;
            world.onSurface = true;
            world.currentWaypointId = wp.id;
            justArrivedRef.current = true;
            if (state === "falling" || state === "jump") setState("landing");
            break;
          }
        }
      }

      // Edge detection: fell off a surface
      if (world.onSurface && world.currentWaypointId) {
        const wp = findWaypoint(waypoints, world.currentWaypointId);
        if (wp && (world.x + PENGUIN_W < wp.x || world.x > wp.x + wp.width)) {
          // Walked off the edge
          world.onSurface = false;
          world.vy = 0;
          if (state === "walk-right" || state === "walk-left") {
            setState("trip");
          }
          world.currentWaypointId = null;
          world.targetWaypointId = null;
          world.targetX = null;
        }
      }

      // Keep penguin in horizontal bounds
      if (world.x < 0) world.x = 0;
      if (world.x > document.documentElement.scrollWidth - PENGUIN_W) {
        world.x = document.documentElement.scrollWidth - PENGUIN_W;
      }

      // --- Walking toward target ---
      if (
        world.onSurface &&
        world.targetX !== null &&
        (state === "walk-right" || state === "walk-left")
      ) {
        const dx = world.targetX - world.x;
        if (Math.abs(dx) < WALK_SPEED * 2) {
          // Arrived at target x
          world.x = world.targetX;
          world.vx = 0;
          world.targetX = null;

          if (world.targetWaypointId) {
            // Check if we need to jump to a different surface
            const targetWp = findWaypoint(waypoints, world.targetWaypointId);
            const currentWp = world.currentWaypointId
              ? findWaypoint(waypoints, world.currentWaypointId)
              : null;

            if (targetWp && currentWp && Math.abs(targetWp.y - currentWp.y) > PENGUIN_H) {
              // Need to jump
              setState("jump");
              world.vy = JUMP_VY;
              world.vx = targetWp.x > world.x ? JUMP_VX : -JUMP_VX;
              world.onSurface = false;
              world.currentWaypointId = null;
            } else if (targetWp) {
              world.currentWaypointId = world.targetWaypointId;
              world.targetWaypointId = null;
              justArrivedRef.current = true;
              setState("idle");
            }
          } else {
            setState("idle");
          }
        } else {
          world.vx = dx > 0 ? WALK_SPEED : -WALK_SPEED;
          world.facingRight = dx > 0;
          if (dx > 0 && state !== "walk-right") setState("walk-right");
          if (dx < 0 && state !== "walk-left") setState("walk-left");
        }
      }

      // --- Belly slide movement ---
      if (state === "belly-slide" && world.onSurface) {
        world.x += world.facingRight ? 3 : -3;
      }

      // --- Action timer ---
      if (actionDurationRef.current > 0) {
        actionTimerRef.current += dt;
        if (actionTimerRef.current >= actionDurationRef.current) {
          actionTimerRef.current = 0;
          actionDurationRef.current = 0;
          setState("idle");
        }
      }

      // --- Behavior tree ---
      if (
        world.onSurface &&
        state === "idle" &&
        actionDurationRef.current === 0 &&
        world.targetX === null
      ) {
        behaviorTimerRef.current += dt;
        if (behaviorTimerRef.current >= behaviorDelayRef.current || justArrivedRef.current) {
          behaviorTimerRef.current = 0;
          behaviorDelayRef.current = nextDecisionDelay();
          const currentWp = world.currentWaypointId
            ? findWaypoint(waypoints, world.currentWaypointId)
            : null;
          const decision = decideBehavior(
            currentWp ?? null,
            waypoints,
            justArrivedRef.current
          );
          justArrivedRef.current = false;

          if (decision.type === "action") {
            setState(decision.state);
            actionDurationRef.current = decision.duration;
            actionTimerRef.current = 0;
          } else if (decision.type === "move") {
            const targetWp = findWaypoint(waypoints, decision.targetWaypointId);
            if (targetWp) {
              world.targetWaypointId = decision.targetWaypointId;
              // Walk to a random x on the target surface
              const targetX = targetWp.x + Math.random() * (targetWp.width - PENGUIN_W);
              world.targetX = Math.max(targetWp.x, Math.min(targetX, targetWp.x + targetWp.width - PENGUIN_W));
              world.facingRight = world.targetX > world.x;
              setState(world.facingRight ? "walk-right" : "walk-left");
            }
          }
        }
      }

      // --- Draw ---
      const screenX = world.x - window.scrollX;
      const screenY = world.y - window.scrollY;

      // Only draw if penguin is visible on screen
      if (
        screenX + PENGUIN_W > 0 &&
        screenX < w &&
        screenY + PENGUIN_H > 0 &&
        screenY < h
      ) {
        const frame = anim.frames[frameIndexRef.current] ?? anim.frames[0];
        const shouldFlip = anim.flipH ?? !world.facingRight;
        drawSprite(ctx, frame, screenX, screenY, shouldFlip);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
    };
  }, [setState, drawSprite]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-30 hidden md:block pointer-events-none"
      style={{ imageRendering: "pixelated" }}
      aria-label="Interactive penguin companion"
      role="img"
    />
  );
}
```

**Step 2: Verify compilation**

Run: `cd next-app && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

**Step 3: Run lint**

Run: `cd next-app && npx eslint components/penguin/ 2>&1 | head -20`
Expected: No errors

**Step 4: Commit**

```bash
git add next-app/components/penguin/PenguinCompanion.tsx
git commit -m "feat: rewrite PenguinCompanion as full-page explorer with behavior tree"
```

---

### Task 5: Visual Testing and Polish

**Files:**
- Possibly modify: `next-app/components/penguin/PenguinCompanion.tsx`
- Possibly modify: `next-app/components/penguin/behavior.ts`
- Possibly modify: `next-app/components/penguin/waypoints.ts`

**Step 1: Start dev server and test**

Run: `cd next-app && npm run dev`

Test each behavior:
1. **Idle** -- penguin should breathe, occasionally look/shuffle/yawn
2. **Walking** -- penguin waddles between waypoints
3. **Jumping** -- penguin jumps to reach surfaces at different heights
4. **Falling off edge** -- trip animation then fall
5. **Landing** -- squish on impact
6. **Contextual actions** -- sit on cards, nap on footer, peck at headings, dance, belly-slide
7. **Scroll up fast** -- tumble reaction
8. **Click** -- poke jump
9. **Surface detection** -- penguin lands on article cards, project cards, footer

**Step 2: Tune parameters if needed**

Key constants to adjust:
- `WALK_SPEED` (1.5) -- penguin waddle speed
- `JUMP_VX` / `JUMP_VY` -- jump arc
- `GRAVITY` (0.8) -- fall speed
- `nextDecisionDelay` range (3000-8000ms) -- how often penguin acts
- Behavior tree probabilities in `decideBehavior`
- `frameDuration` on new animations

**Step 3: Final lint and type check**

Run: `cd next-app && npx tsc --noEmit && npx eslint components/penguin/`
Expected: No errors

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: polish penguin v2 animations and behavior tuning"
```
