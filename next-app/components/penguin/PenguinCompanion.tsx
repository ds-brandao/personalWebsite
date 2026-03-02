"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import {
  PENGUIN_PALETTE,
  ANIMATIONS,
  PIXEL_SCALE,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  type PenguinState,
  type SpriteFrame,
} from "./sprites";

const PENGUIN_W = SPRITE_WIDTH * PIXEL_SCALE;
const PENGUIN_H = SPRITE_HEIGHT * PIXEL_SCALE;

interface ScriptedAppearance {
  scrollRange: [number, number];
  getPosition: (progress: number, viewW: number, viewH: number) => { x: number; y: number };
  state: PenguinState;
  flipH: boolean;
}

const APPEARANCES: ScriptedAppearance[] = [
  {
    scrollRange: [0.1, 0.2],
    getPosition: (progress, viewW, viewH) => {
      const t = (progress - 0.1) / 0.1;
      const x = viewW - PENGUIN_W * t;
      const y = viewH * 0.5;
      return { x, y };
    },
    state: "idle-look",
    flipH: true,
  },
  {
    scrollRange: [0.45, 0.75],
    getPosition: (_progress, viewW, viewH) => {
      const x = viewW * 0.05;
      const y = viewH - PENGUIN_H - 40;
      return { x, y };
    },
    state: "sit",
    flipH: false,
  },
  {
    scrollRange: [0.88, 1.0],
    getPosition: (progress, viewW, viewH) => {
      const t = (progress - 0.88) / 0.12;
      const x = viewW * 0.5 - PENGUIN_W / 2;
      const y = viewH * 0.6 - PENGUIN_H * t * 0.3;
      return { x, y };
    },
    state: "dance",
    flipH: false,
  },
];

export function PenguinCompanion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const stateRef = useRef<PenguinState>("idle");
  const frameIndexRef = useRef(0);
  const frameTimerRef = useRef(0);
  const lastTimeRef = useRef(0);
  const posRef = useRef({ x: -100, y: -100 });
  const flipRef = useRef(false);
  const visibleRef = useRef(false);
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    let found = false;
    for (const appearance of APPEARANCES) {
      const [start, end] = appearance.scrollRange;
      if (progress >= start && progress <= end) {
        const viewW = window.innerWidth;
        const viewH = window.innerHeight;
        const pos = appearance.getPosition(progress, viewW, viewH);
        posRef.current = pos;
        flipRef.current = appearance.flipH;
        found = true;

        if (stateRef.current !== appearance.state) {
          stateRef.current = appearance.state;
          frameIndexRef.current = 0;
          frameTimerRef.current = 0;
        }
        break;
      }
    }
    visibleRef.current = found;
  });

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
          ctx.fillRect(col * PIXEL_SCALE, row * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
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
    lastTimeRef.current = performance.now();

    const animate = (now: number) => {
      const dt = Math.min(now - lastTimeRef.current, 50);
      lastTimeRef.current = now;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      if (visibleRef.current) {
        const state = stateRef.current;
        const anim = ANIMATIONS[state];

        frameTimerRef.current += dt;
        if (frameTimerRef.current >= anim.frameDuration) {
          frameTimerRef.current -= anim.frameDuration;
          frameIndexRef.current++;
          if (frameIndexRef.current >= anim.frames.length) {
            frameIndexRef.current = anim.loop ? 0 : anim.frames.length - 1;
          }
        }

        const frame = anim.frames[frameIndexRef.current] ?? anim.frames[0];
        drawSprite(ctx, frame, posRef.current.x, posRef.current.y, flipRef.current);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [drawSprite]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-30 hidden md:block pointer-events-none"
      style={{ imageRendering: "pixelated" }}
      aria-label="Penguin narrator"
      role="img"
    />
  );
}
