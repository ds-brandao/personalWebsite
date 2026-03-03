"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { GitCommitIcon, FileTextIcon, StarIcon } from "lucide-react";
import { motion } from "motion/react";

export type ActivityItem =
  | {
      type: "commit";
      sha: string;
      message: string;
      repo: string;
      author: string;
      date: string;
    }
  | {
      type: "article";
      title: string;
      summary: string;
      slug: string;
      tags: string[];
    }
  | {
      type: "featured";
      title: string;
      source: string;
      url: string;
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
}: {
  item: ActivityItem;
  index: number;
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
            <span className="line-clamp-1">{item.summary}</span>
          )}
          {item.type === "featured" && (
            <span>Press mention</span>
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
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors">
        {content}
      </a>
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
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="divide-y divide-border">
      {items.map((item, i) => (
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
        />
      ))}
    </div>
  );
}
