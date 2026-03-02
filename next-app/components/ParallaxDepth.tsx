"use client";

import { useScroll, useTransform, motion, MotionValue } from "motion/react";

const CIRCLES = [
  { x: "10%", y: "15%", size: "30vw", color: "var(--color-claude-taupe)", opacity: 0.06 },
  { x: "70%", y: "40%", size: "25vw", color: "var(--color-claude-cream)", opacity: 0.05 },
  { x: "40%", y: "70%", size: "35vw", color: "var(--color-claude-taupe)", opacity: 0.04 },
  { x: "85%", y: "20%", size: "20vw", color: "var(--color-claude-muted-brown)", opacity: 0.03 },
  { x: "20%", y: "90%", size: "28vw", color: "var(--color-claude-cream)", opacity: 0.05 },
];

export function ParallaxDepth() {
  const { scrollY } = useScroll();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {CIRCLES.map((circle, i) => (
        <ParallaxCircle key={i} circle={circle} scrollY={scrollY} index={i} />
      ))}
    </div>
  );
}

function ParallaxCircle({
  circle,
  scrollY,
  index,
}: {
  circle: (typeof CIRCLES)[0];
  scrollY: MotionValue<number>;
  index: number;
}) {
  const rate = 0.03 + index * 0.01;
  const y = useTransform(scrollY, (v) => v * -rate);

  return (
    <motion.div
      style={{
        left: circle.x,
        top: circle.y,
        width: circle.size,
        height: circle.size,
        y,
        opacity: circle.opacity,
        backgroundColor: circle.color,
      }}
      className="absolute rounded-full blur-3xl"
    />
  );
}
