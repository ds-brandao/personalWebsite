"use client";

import { useMemo, useState } from "react";
import { FeaturedEmbedDialog } from "@/components/FeaturedEmbedDialog";
import type { FeaturedItem } from "@/types";

const INITIAL_COUNT = 3;

export function FeaturedSection({ items }: { items: FeaturedItem[] }) {
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [items],
  );

  const visible = expanded ? sorted : sorted.slice(0, INITIAL_COUNT);
  const hasMore = sorted.length > INITIAL_COUNT;
  const activeItem = items.find((item) => item.url === openUrl);

  return (
    <section className="mb-10">
      <h2 className="font-display text-xl font-semibold text-foreground mb-4">
        Featured In
      </h2>
      <div className="space-y-3">
        {visible.map((item) => (
          <button
            key={item.url}
            type="button"
            onClick={() => setOpenUrl(item.url)}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.source}
              </p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </button>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? "Show less" : `Show ${sorted.length - INITIAL_COUNT} more`}
        </button>
      )}

      <FeaturedEmbedDialog
        open={!!openUrl}
        onOpenChange={(open) => !open && setOpenUrl(null)}
        url={openUrl}
        title={activeItem?.title}
        source={activeItem?.source}
      />
    </section>
  );
}
