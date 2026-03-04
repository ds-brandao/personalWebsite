"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-0 sm:px-6 sm:pt-6">
          <DialogTitle className="pr-8 text-base sm:text-lg">
            {title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
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
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}
