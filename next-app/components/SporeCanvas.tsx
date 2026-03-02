"use client";

import { useRef, useEffect } from "react";

interface Spore {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  phase: number;
}

const LIGHT_COLORS = ["#D2C3B7", "#7E6E5C", "#3F3227"];
const DARK_COLORS = ["#FDF9F3", "#D2C3B7", "#7E6E5C"];

export function SporeCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sporesRef = useRef<Spore[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const isDark = () => document.documentElement.classList.contains("dark");
    const count = window.innerWidth < 768 ? 25 : 40;

    const createSpore = (): Spore => {
      const colors = isDark() ? DARK_COLORS : LIGHT_COLORS;
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -(Math.random() * 0.4 + 0.1),
        opacity: Math.random() * 0.2 + 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
      };
    };

    sporesRef.current = Array.from({ length: count }, createSpore);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("resize", resize, { passive: true });

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      time += 0.01;

      const currentColors = isDark() ? DARK_COLORS : LIGHT_COLORS;

      for (const s of sporesRef.current) {
        s.x += s.speedX + Math.sin(time + s.phase) * 0.15;
        s.y += s.speedY;

        const dx = s.x - mouseRef.current.x;
        const dy = s.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = ((150 - dist) / 150) * 0.5;
          s.x += (dx / dist) * force;
          s.y += (dy / dist) * force;
        }

        if (s.y < -10) {
          s.y = window.innerHeight + 10;
          s.x = Math.random() * window.innerWidth;
        }
        if (s.x < -10) s.x = window.innerWidth + 10;
        if (s.x > window.innerWidth + 10) s.x = -10;

        if (!currentColors.includes(s.color)) {
          s.color = currentColors[Math.floor(Math.random() * currentColors.length)];
        }

        const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
        gradient.addColorStop(0, s.color);
        gradient.addColorStop(1, "transparent");
        ctx.globalAlpha = s.opacity;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
