"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "motion/react";

interface ScrollRevealTextProps {
  text: string;
  className?: string;
  as?: "h2" | "h3" | "p" | "span";
}

function AnimatedWord({
  word,
  progress,
  index,
  total,
}: {
  word: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.15, 1]);

  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.25em]">
      {word}
    </motion.span>
  );
}

export function ScrollRevealText({
  text,
  className,
  as: Tag = "p",
}: ScrollRevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.3"],
  });

  const words = text.split(" ");

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={className}>
      {words.map((word, i) => (
        <AnimatedWord
          key={i}
          word={word}
          progress={scrollYProgress}
          index={i}
          total={words.length}
        />
      ))}
    </Tag>
  );
}
