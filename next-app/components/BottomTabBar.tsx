"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Code } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/articles", label: "Articles", icon: FileText },
  { href: "/projects", label: "Projects", icon: Code },
];

export function BottomTabBar() {
  const pathname = usePathname();

  const activeTab = tabs.find(
    (tab) => tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
  );

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <div
        className="flex items-center gap-1 rounded-full px-2 py-2"
        style={{
          background: "var(--card)",
          boxShadow:
            "6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.6), inset 1px 1px 2px rgba(255,255,255,0.3)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab?.href === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-full text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "var(--background)",
                    boxShadow:
                      "3px 3px 6px rgba(0,0,0,0.06), -3px -3px 6px rgba(255,255,255,0.5)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon className="relative z-10 size-5" />
              <span className="relative z-10">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
