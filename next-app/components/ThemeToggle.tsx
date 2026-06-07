"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="grid size-9.5 place-items-center rounded-full border border-border-strong text-muted-foreground transition-all duration-300 ease-snap hover:border-primary-line hover:text-primary active:scale-90"
    >
      {mounted && isDark ? (
        <Sun className="size-4.5" strokeWidth={1.8} />
      ) : (
        <Moon className="size-4.5" strokeWidth={1.8} />
      )}
    </button>
  );
}
