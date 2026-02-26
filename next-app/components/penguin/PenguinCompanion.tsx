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
const CANVAS_W = SPRITE_WIDTH * PIXEL_SCALE + 16; // 8px padding each side
const CANVAS_H = SPRITE_HEIGHT * PIXEL_SCALE + 32; // 8px bottom + 24px top for jump clearance

// Physics constants
const GRAVITY = 0.6;
const TERMINAL_VELOCITY = 12;
const SCROLL_UP_TUMBLE_THRESHOLD = 30; // px/frame delta to trigger tumble
const POKE_JUMP_VELOCITY = -6;
const SCROLL_IDLE_THRESHOLD = 100; // ms without scroll to consider "stopped"

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
      scrollDeltaRef.current += currentY - lastScrollYRef.current;
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
        physicsRef.current.velocity = POKE_JUMP_VELOCITY;
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
        scrollIdleTimerRef.current > SCROLL_IDLE_THRESHOLD &&
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
