"use client";

import { useRef, useEffect, useState, useCallback } from "react";

const EMBER_COLORS = ["#f97316", "#fb923c", "#ea580c", "#f59e0b", "#f43f5e"];

// Grid-based letter definitions for "DSB" (each letter on a 5x7 grid)
const LETTERS: Record<string, number[][]> = {
  D: [
    [1, 1, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 0, 0],
  ],
  S: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  B: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
};

interface LoadingParticle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  size: number;
  color: string;
  opacity: number;
  burstVx: number;
  burstVy: number;
}

function getLetterTargets(
  width: number,
  height: number
): { x: number; y: number }[] {
  const targets: { x: number; y: number }[] = [];
  const letters = ["D", "S", "B"];
  const cellSize = Math.min(width, height) * 0.02;
  const gap = cellSize * 1.5;
  const letterWidth = 5 * (cellSize + gap);
  const letterSpacing = cellSize * 3;
  const totalWidth =
    letters.length * letterWidth + (letters.length - 1) * letterSpacing;
  const startX = (width - totalWidth) / 2;
  const startY = (height - 7 * (cellSize + gap)) / 2;

  letters.forEach((letter, li) => {
    const grid = LETTERS[letter];
    const offsetX = startX + li * (letterWidth + letterSpacing);
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col]) {
          targets.push({
            x: offsetX + col * (cellSize + gap) + cellSize / 2,
            y: startY + row * (cellSize + gap) + cellSize / 2,
          });
        }
      }
    }
  });

  return targets;
}

type Phase = "forming" | "holding" | "dissolving" | "done";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("forming");
  const phaseRef = useRef<Phase>("forming");
  const phaseStartRef = useRef(performance.now());
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<LoadingParticle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(1);

  const updatePhase = useCallback(
    (newPhase: Phase) => {
      phaseRef.current = newPhase;
      phaseStartRef.current = performance.now();
      setPhase(newPhase);
      if (newPhase === "done") {
        onComplete();
      }
    },
    [onComplete]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const targets = getLetterTargets(w, h);
    particlesRef.current = targets.map((t) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      targetX: t.x,
      targetY: t.y,
      startX: Math.random() * w,
      startY: Math.random() * h,
      size: Math.random() * 2 + 2,
      color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
      opacity: 1,
      burstVx: (Math.random() - 0.5) * 8,
      burstVy: (Math.random() - 0.5) * 8 - 2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const elapsed = (performance.now() - phaseStartRef.current) / 1000;
      const currentPhase = phaseRef.current;

      if (currentPhase === "forming") {
        const progress = Math.min(elapsed / 1.2, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

        for (const p of particlesRef.current) {
          p.x = p.startX + (p.targetX - p.startX) * eased;
          p.y = p.startY + (p.targetY - p.startY) * eased;
          drawParticle(ctx, p);
        }

        if (progress >= 1) updatePhase("holding");
      } else if (currentPhase === "holding") {
        for (const p of particlesRef.current) {
          const wave = Math.sin(elapsed * 3 + p.targetX * 0.01) * 2;
          p.x = p.targetX + wave;
          p.y = p.targetY + Math.cos(elapsed * 2 + p.targetY * 0.01) * 1.5;
          drawParticle(ctx, p);
        }

        if (elapsed >= 1.5) updatePhase("dissolving");
      } else if (currentPhase === "dissolving") {
        const progress = Math.min(elapsed / 1.0, 1);

        for (const p of particlesRef.current) {
          p.x += p.burstVx;
          p.y += p.burstVy;
          p.burstVy += 0.1; // gravity
          p.opacity = 1 - progress;
          p.size *= 0.995;
          drawParticle(ctx, p);
        }

        setOpacity(1 - progress);

        if (progress >= 1) updatePhase("done");
      }

      if (currentPhase !== "done") {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [updatePhase]);

  if (phase === "done") return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-bg"
      style={{ opacity }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: LoadingParticle
) {
  const alpha = Math.round(p.opacity * 255)
    .toString(16)
    .padStart(2, "0");

  // Glow
  const gradient = ctx.createRadialGradient(
    p.x,
    p.y,
    0,
    p.x,
    p.y,
    p.size * 4
  );
  gradient.addColorStop(0, p.color + alpha);
  gradient.addColorStop(1, p.color + "00");
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Core
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fillStyle = p.color + alpha;
  ctx.fill();
}
