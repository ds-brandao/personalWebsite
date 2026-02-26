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
        const el = document.querySelector("#hero");
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + window.scrollX,
          y: rect.bottom + window.scrollY,
          width: rect.width,
        };
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
        ...(i > 0 ? [`card-${i - 1}`] : []),
        `card-${i + 1}`,
        "articles-top",
      ],
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
        ...(i > 0 ? [`project-${i - 1}`] : []),
        `project-${i + 1}`,
        "projects-top",
      ],
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
