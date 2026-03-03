"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, FileText, Code, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { cn } from "@/lib/utils";

const neumorphicStyle = {
  background: "var(--card)",
  boxShadow:
    "6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.6), inset 1px 1px 2px rgba(255,255,255,0.3)",
};

// Apple .snappy spring: slight overshoot, quick settle
const snappySpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/articles", label: "Articles", icon: FileText },
  { href: "/projects", label: "Projects", icon: Code },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = tabs.find(
    (tab) => tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
  );

  // Show back button on sub-pages (e.g. /articles/some-slug)
  const isSubPage = tabs.every(
    (tab) => tab.href !== pathname
  ) && pathname !== "/";

  return (
    <LayoutGroup>
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <motion.div className="flex items-center gap-2" layout transition={snappySpring}>
          {/* Back button pill — materializes next to the tab bar */}
          <AnimatePresence mode="popLayout">
            {isSubPage && (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={snappySpring}
                className="origin-right rounded-full px-2 py-2"
                style={neumorphicStyle}
              >
                <button
                  onClick={() => router.back()}
                  className="flex flex-col items-center justify-center gap-0.5 rounded-full px-4 py-2 text-xs font-medium text-muted-foreground"
                >
                  <ArrowLeft className="size-5" />
                  <span>Back</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab bar pill */}
          <motion.div
            layout
            transition={snappySpring}
            className="flex items-center gap-1 rounded-full px-2 py-2"
            style={neumorphicStyle}
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
                      transition={snappySpring}
                    />
                  )}
                  <tab.icon className="relative z-10 size-5" />
                  <span className="relative z-10">{tab.label}</span>
                </Link>
              );
            })}
          </motion.div>
        </motion.div>
      </nav>
    </LayoutGroup>
  );
}
