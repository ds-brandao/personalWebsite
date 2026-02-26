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
  idle: 1500,
  dance: 2500,
  "belly-slide": 1500,
  sit: 2500,
  nap: 3500,
  peck: 1000,
  push: 1500,
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
  const reachable = currentWaypoint.connections
    .map((id) => allWaypoints.find((wp) => wp.id === id))
    .filter((wp): wp is ResolvedWaypoint => wp != null);

  if (justArrived) {
    // Just arrived — do a quick action, then move on soon
    if (roll < 0.5 && currentWaypoint.actions.length > 0) {
      const action = pickRandom(currentWaypoint.actions);
      return {
        type: "action",
        state: ACTION_TO_STATE[action],
        duration: ACTION_DURATIONS[action],
      };
    }
    // Quick look around then move
    if (roll < 0.65) {
      return { type: "action", state: "idle-look", duration: 800 };
    }
    if (reachable.length > 0) {
      return { type: "move", targetWaypointId: pickRandom(reachable).id };
    }
    return { type: "idle" };
  }

  // Regular decision — heavy movement bias to explore the page
  if (roll < 0.55) {
    // Walk to a connected waypoint
    if (reachable.length > 0) {
      return { type: "move", targetWaypointId: pickRandom(reachable).id };
    }
    return { type: "idle" };
  } else if (roll < 0.75 && currentWaypoint.actions.length > 0) {
    // Contextual action
    const action = pickRandom(currentWaypoint.actions);
    return {
      type: "action",
      state: ACTION_TO_STATE[action],
      duration: ACTION_DURATIONS[action],
    };
  } else if (roll < 0.85) {
    // Belly slide if available, otherwise shuffle walk
    if (currentWaypoint.actions.includes("belly-slide")) {
      return { type: "action", state: "belly-slide", duration: 1200 };
    }
    if (reachable.length > 0) {
      return { type: "move", targetWaypointId: pickRandom(reachable).id };
    }
    return { type: "idle" };
  } else {
    // Idle personality — varied animations
    const idleStates: PenguinState[] = ["idle-look", "idle-yawn", "idle-shuffle"];
    return {
      type: "action",
      state: pickRandom(idleStates),
      duration: 1200,
    };
  }
}

// How long to wait between behavior decisions (ms)
export function nextDecisionDelay(): number {
  return randomBetween(800, 2000);
}
