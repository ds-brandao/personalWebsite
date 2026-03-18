"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeaturedEmbedDialog } from "@/components/FeaturedEmbedDialog";
import { GitCommitIcon, FileTextIcon, StarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type ActivityItem =
  | {
      type: "commit";
      sha: string;
      message: string;
      repo: string;
      date: string;
    }
  | {
      type: "article";
      title: string;
      summary: string;
      slug: string;
      date: string;
    }
  | {
      type: "featured";
      title: string;
      source: string;
      url: string;
      date: string;
    };

const icons = {
  commit: GitCommitIcon,
  article: FileTextIcon,
  featured: StarIcon,
} as const;

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function formatRelative(dateStr: string): string {
  const days = Math.round(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return relativeTime.format(days, "day");
}

function FeedRow({
  item,
  index,
  onFeaturedClick,
}: {
  item: ActivityItem;
  index: number;
  onFeaturedClick?: (url: string) => void;
}) {
  const Icon = icons[item.type];

  const content = (
    <div className="flex items-start gap-3 py-3 group">
      {/* Icon */}
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground leading-snug">
            {item.type === "commit" && item.message}
            {item.type === "article" && item.title}
            {item.type === "featured" && item.title}
          </p>
          <Badge variant="secondary" className="text-[10px] shrink-0 mt-0.5">
            {item.type === "commit" && item.repo}
            {item.type === "article" && "Blog"}
            {item.type === "featured" && item.source}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
          {item.type === "commit" && (
            <>
              <span className="font-mono">{item.sha.slice(0, 7)}</span>
              <span>·</span>
              <span>{formatRelative(item.date)}</span>
            </>
          )}
          {item.type === "article" && (
            <>
              <span className="line-clamp-1">{item.summary}</span>
              <span>·</span>
              <span className="shrink-0">{formatRelative(item.date)}</span>
            </>
          )}
          {item.type === "featured" && (
            <>
              <span>Press mention</span>
              <span>·</span>
              <span className="shrink-0">{formatRelative(item.date)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const wrapped =
    item.type === "article" ? (
      <Link href={`/articles/${item.slug}`} className="block hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors">
        {content}
      </Link>
    ) : item.type === "featured" ? (
      <button
        type="button"
        onClick={() => onFeaturedClick?.(item.url)}
        className="block w-full text-left hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
      >
        {content}
      </button>
    ) : (
      <div className="-mx-2 px-2">{content}</div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      {wrapped}
    </motion.div>
  );
}

interface ActivityFeedProps {
  items: ActivityItem[];
  initialCount?: number;
}

export function ActivityFeed({ items, initialCount = 3 }: ActivityFeedProps) {
  const [expanded, setExpanded] = useState(false);
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const visible = expanded ? items : items.slice(0, initialCount);
  const hasMore = items.length > initialCount;

  const activeItem = items.find(
    (item) => item.type === "featured" && item.url === openUrl
  ) as Extract<ActivityItem, { type: "featured" }> | undefined;

  return (
    <div>
      <div className="divide-y divide-border">
        <AnimatePresence initial={false}>
          {visible.map((item, i) => (
            <FeedRow
              key={
                item.type === "commit"
                  ? item.sha
                  : item.type === "article"
                    ? item.slug
                    : item.url
              }
              item={item}
              index={i}
              onFeaturedClick={setOpenUrl}
            />
          ))}
        </AnimatePresence>
      </div>
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 w-full text-muted-foreground"
        >
          {expanded ? (
            <>
              <ChevronUp className="mr-1 size-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 size-4" />
              Show more ({items.length - initialCount} more)
            </>
          )}
        </Button>
      )}

      <FeaturedEmbedDialog
        open={!!openUrl}
        onOpenChange={(open) => !open && setOpenUrl(null)}
        url={openUrl}
        title={activeItem?.title}
        source={activeItem?.source}
      />
    </div>
  );
}
