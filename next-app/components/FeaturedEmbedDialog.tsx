"use client";

import { Drawer } from "vaul";
import { ExternalLinkIcon } from "lucide-react";

interface FeaturedEmbedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  title?: string;
  source?: string;
}

export function FeaturedEmbedDialog({
  open,
  onOpenChange,
  url,
  title,
  source,
}: FeaturedEmbedDialogProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex h-[92vh] flex-col rounded-t-2xl bg-background">
          {/* iOS-style drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <Drawer.Handle className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          <Drawer.Title className="px-4 text-base font-semibold text-foreground sm:px-6 sm:text-lg">
            {title}
          </Drawer.Title>
          <Drawer.Description className="flex items-center gap-2 px-4 pb-3 text-sm text-muted-foreground sm:px-6">
            <span>{source}</span>
            <span>·</span>
            <a
              href={url ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs hover:underline"
            >
              Open in new tab
              <ExternalLinkIcon className="size-3" />
            </a>
          </Drawer.Description>

          <div className="flex-1 min-h-0 px-4 pb-4 sm:px-6 sm:pb-6">
            {url && (
              <iframe
                src={url}
                title={title ?? "Featured article"}
                className="h-full w-full rounded-md border border-border"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
