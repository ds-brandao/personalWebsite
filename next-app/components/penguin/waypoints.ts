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

// Static waypoints defined by page structure (only real visible surfaces)
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
      connections: ["ground"], // card connections added dynamically
    },
    {
      id: "footer-top",
      getRect: () => queryElement("footer"),
      actions: ["idle", "nap", "sit", "dance"],
      connections: ["ground"], // project connections added dynamically
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
      ],
    });
  });

  // Project cards (desktop horizontal scroll items only)
  const projectCards = document.querySelectorAll("#projects .overflow-x-auto .flex > div");
  projectCards.forEach((el, i) => {
    const id = `project-${i}`;
    waypoints.push({
      id,
      getRect: () => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0) return null; // hidden element
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

// Resolve all waypoints to current positions, enriching cross-connections
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
        connections: [...wp.connections],
      });
    }
  }

  // Enrich connections: wire real visible surfaces together
  const cardIds = resolved.filter((wp) => wp.id.startsWith("card-")).map((wp) => wp.id);
  const projectIds = resolved.filter((wp) => wp.id.startsWith("project-")).map((wp) => wp.id);

  const addConn = (wpId: string, targetId: string) => {
    const wp = resolved.find((w) => w.id === wpId);
    if (wp && !wp.connections.includes(targetId)) wp.connections.push(targetId);
  };

  // hero-floor ↔ first article cards
  for (const id of cardIds.slice(0, 3)) {
    addConn("hero-floor", id);
    addConn(id, "hero-floor");
  }

  // last article card ↔ first project cards
  if (cardIds.length > 0 && projectIds.length > 0) {
    const lastCardId = cardIds[cardIds.length - 1];
    for (const id of projectIds.slice(0, 3)) {
      addConn(lastCardId, id);
      addConn(id, lastCardId);
    }
  }

  // last project card ↔ footer
  if (projectIds.length > 0) {
    addConn(projectIds[projectIds.length - 1], "footer-top");
    addConn("footer-top", projectIds[projectIds.length - 1]);
  }

  // If no cards, hero connects directly to projects or footer
  if (cardIds.length === 0 && projectIds.length > 0) {
    for (const id of projectIds.slice(0, 3)) {
      addConn("hero-floor", id);
      addConn(id, "hero-floor");
    }
  }
  if (cardIds.length === 0 && projectIds.length === 0) {
    addConn("hero-floor", "footer-top");
    addConn("footer-top", "hero-floor");
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
