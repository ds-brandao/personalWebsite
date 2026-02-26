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
