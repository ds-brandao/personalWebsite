"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  /** Transition delay in ms — used to stagger grids/lists. */
  delay?: number;
  className?: string;
}

let observer: IntersectionObserver | undefined;

function getObserver() {
  return observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove("pending");
        entry.target.classList.add("in");
        observer?.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
}

/** Fades content up when it scrolls into view (pairs with the .reveal CSS). */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      el.getBoundingClientRect().top < window.innerHeight
    ) return;

    // Server-rendered and above-the-fold content stays visible. Animate only
    // off-screen content, using one observer for the whole page.
    el.classList.add("pending");
    const io = getObserver();
    io.observe(el);
    return () => {
      io.unobserve(el);
      el.classList.remove("pending");
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
