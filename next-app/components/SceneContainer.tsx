"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface SceneContainerProps {
  id: string;
  children: ReactNode;
  className?: string;
  minHeight?: boolean;
}

export function SceneContainer({
  id,
  children,
  className = "",
  minHeight = false,
}: SceneContainerProps) {
  return (
    <motion.section
      id={id}
      className={`${minHeight ? "min-h-screen" : "h-screen"} relative ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.section>
  );
}
