"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/projects", label: "Projects" },
];

export function TopNav({ name }: { name: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 hidden border-b bg-background/80 backdrop-blur-md transition-colors duration-300 md:block",
        scrolled ? "border-border" : "border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-5 px-(--pad) py-3.5">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Home">
          <span className="grid size-7.5 place-items-center rounded-[8px] bg-foreground font-display text-sm font-bold tracking-[-0.04em] text-background transition-transform duration-400 ease-snap group-hover:-rotate-6 group-hover:scale-105">
            {initials}
          </span>
          <span className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
            {name}
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-[14.5px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute inset-x-3.5 bottom-0.5 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
