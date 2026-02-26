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
const WALK_SPEED = 2.5;
const SCROLL_TUMBLE_THRESHOLD = 40;
const OFFSCREEN_RELOCATE_DELAY = 1500; // ms before penguin follows viewport

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

  // Waypoints cache (refreshed periodically; start past threshold to resolve on first frame)
  const waypointsRef = useRef<ResolvedWaypoint[]>([]);
  const waypointRefreshRef = useRef(2001);

  // Scroll tracking
  const lastScrollYRef = useRef(0);
  const scrollDeltaRef = useRef(0);

  // Off-screen tracking for viewport following
  const offScreenTimerRef = useRef(0);
  const offScreenScrollYRef = useRef(0); // scrollY when penguin first went off-screen

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

    // Initial position: fall in from top of current viewport
    worldRef.current.y = window.scrollY - PENGUIN_H;
    worldRef.current.x = 60 + Math.random() * 200;
    worldRef.current.onSurface = false;
    worldRef.current.vy = 0;
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
        scrollDelta > 5 &&
        state !== "falling" &&
        state !== "tumble" &&
        state !== "getting-up" &&
        state !== "poked" &&
        state !== "landing"
      ) {
        // Scrolling down -> penguin falls
        setState("falling");
        world.onSurface = false;
        world.vy = 2;
        world.vx = 0;
        world.currentWaypointId = null;
        world.targetWaypointId = null;
        world.targetX = null;
        actionTimerRef.current = 0;
        actionDurationRef.current = 0;
      } else if (
        scrollDelta < -SCROLL_TUMBLE_THRESHOLD &&
        state !== "tumble" &&
        state !== "getting-up" &&
        state !== "poked"
      ) {
        // Scrolling up fast -> tumble
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
        if (!world.currentWaypointId) {
          world.currentWaypointId = "ground";
          justArrivedRef.current = true;
        }
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
              // Need to jump — calculate velocity to reach target height
              const heightDiff = currentWp.y - targetWp.y; // positive = target is above
              if (heightDiff > 0) {
                // Jumping UP: vy needed = -sqrt(2 * gravity * height), capped
                const neededVy = -Math.min(Math.sqrt(2 * GRAVITY * (heightDiff + PENGUIN_H)), 40);
                setState("jump");
                world.vy = neededVy;
                // Scale horizontal speed to arrive at target x during the arc
                const jumpDuration = Math.abs(neededVy) * 2 / GRAVITY; // frames in the air
                const dx = targetWp.x + targetWp.width / 2 - world.x;
                world.vx = dx / Math.max(jumpDuration, 1);
              } else {
                // Target is BELOW: just walk off the edge and fall
                setState("trip");
                world.vy = 0;
                world.vx = targetWp.x > world.x ? WALK_SPEED : -WALK_SPEED;
              }
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

      // --- Viewport-scoped waypoints for behavior ---
      const viewTop = window.scrollY;
      const viewBottom = viewTop + h;
      const visibleWaypoints = waypoints.filter(
        (wp) => wp.y >= viewTop - PENGUIN_H * 2 && wp.y <= viewBottom + PENGUIN_H * 2
      );

      // --- Behavior tree (uses only visible waypoints) ---
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
            ? findWaypoint(visibleWaypoints, world.currentWaypointId)
            : null;
          const decision = decideBehavior(
            currentWp ?? null,
            visibleWaypoints,
            justArrivedRef.current
          );
          justArrivedRef.current = false;

          if (decision.type === "action") {
            setState(decision.state);
            actionDurationRef.current = decision.duration;
            actionTimerRef.current = 0;
          } else if (decision.type === "move") {
            const targetWp = findWaypoint(visibleWaypoints, decision.targetWaypointId);
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

      // --- Off-screen relocation: smooth directional entrance ---
      const penguinScreenY = world.y - window.scrollY;
      const isOnScreen =
        penguinScreenY + PENGUIN_H > -PENGUIN_H &&
        penguinScreenY < h + PENGUIN_H;

      if (!isOnScreen) {
        if (offScreenTimerRef.current === 0) {
          // Record scrollY when penguin first went off-screen
          offScreenScrollYRef.current = window.scrollY;
        }
        offScreenTimerRef.current += dt;

        if (offScreenTimerRef.current >= OFFSCREEN_RELOCATE_DELAY && visibleWaypoints.length > 0) {
          const scrolledUp = window.scrollY < offScreenScrollYRef.current;
          const targetWp = visibleWaypoints[Math.floor(Math.random() * visibleWaypoints.length)];

          world.currentWaypointId = null;
          world.targetWaypointId = null;
          world.targetX = null;
          actionTimerRef.current = 0;
          actionDurationRef.current = 0;

          const randX = targetWp.x + Math.random() * Math.max(0, targetWp.width - PENGUIN_W);

          if (scrolledUp) {
            // User scrolled UP → penguin enters from bottom, jumping up into view
            world.x = randX;
            world.y = viewBottom + PENGUIN_H; // just below viewport
            world.vx = 0;
            // Jump up to reach the target waypoint
            const heightToTravel = world.y - (targetWp.y - PENGUIN_H);
            world.vy = -Math.min(Math.sqrt(2 * GRAVITY * heightToTravel), 35);
            world.onSurface = false;
            setState("jump");
          } else {
            // User scrolled DOWN → penguin falls in from top
            world.x = randX;
            world.y = viewTop - PENGUIN_H * 2; // just above viewport
            world.vx = 0;
            world.vy = 2;
            world.onSurface = false;
            setState("falling");
          }
          offScreenTimerRef.current = 0;
        }
      } else {
        offScreenTimerRef.current = 0;
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
