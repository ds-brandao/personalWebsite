"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExternalLinkIcon } from "lucide-react";
import type { FeaturedItem } from "@/types";

export function FeaturedSection({ items }: { items: FeaturedItem[] }) {
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const activeItem = items.find((item) => item.url === openUrl);

  return (
    <section className="mb-10">
      <h2 className="font-display text-xl font-semibold text-foreground mb-4">
        Featured In
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
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

      <Dialog open={!!openUrl} onOpenChange={(open) => !open && setOpenUrl(null)}>
        <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-4 pt-4 pb-0 sm:px-6 sm:pt-6">
            <DialogTitle className="pr-8 text-base sm:text-lg">{activeItem?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <span>{activeItem?.source}</span>
              <span>·</span>
              <a
                href={activeItem?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs hover:underline"
              >
                Open in new tab
                <ExternalLinkIcon className="size-3" />
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 px-4 pb-4 sm:px-6 sm:pb-6">
            {openUrl && (
              <iframe
                src={openUrl}
                title={activeItem?.title ?? "Featured article"}
                className="h-full w-full rounded-md border border-border"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
