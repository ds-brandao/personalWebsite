"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={compact
        ? "flex items-center justify-center size-9 rounded-full text-muted-foreground transition-colors hover:text-foreground"
        : "grid size-9.5 place-items-center rounded-full border border-border-strong text-muted-foreground transition-all duration-300 ease-snap hover:border-primary-line hover:text-primary active:scale-90"}
    >
      <Sun className={`hidden dark:block ${compact ? "size-4" : "size-4.5"}`} strokeWidth={compact ? 2 : 1.8} />
      <Moon className={`block dark:hidden ${compact ? "size-4" : "size-4.5"}`} strokeWidth={compact ? 2 : 1.8} />
    </button>
  );
}
