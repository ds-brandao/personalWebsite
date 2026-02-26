"use client";

import { useEffect, useState } from "react";

const SCENES = [
  { id: "hero", label: "Home" },
  { id: "articles", label: "Writing" },
  { id: "projects", label: "Projects" },
];

export function DotNav() {
  const [activeId, setActiveId] = useState("hero");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    for (const scene of SCENES) {
      const el = document.getElementById(scene.id);
      if (!el) continue;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(scene.id);
          }
        },
        { threshold: 0.4 }
      );

      observer.observe(el);
      observers.push(observer);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4">
      {SCENES.map((scene) => (
        <button
          key={scene.id}
          onClick={() =>
            document
              .getElementById(scene.id)
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="group relative flex items-center justify-end"
          aria-label={`Scroll to ${scene.label}`}
        >
          <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity text-sm text-text-secondary whitespace-nowrap pr-2">
            {scene.label}
          </span>
          <span
            className={`block rounded-full transition-all duration-300 ${
              activeId === scene.id
                ? "w-3 h-3 bg-ember shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                : "w-2 h-2 bg-text-muted hover:bg-text-secondary"
            }`}
          />
        </button>
      ))}
    </nav>
  );
}
