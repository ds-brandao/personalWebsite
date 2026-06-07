import Link from "next/link";
import { GitCommitHorizontal, PenLine, Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { timeAgo } from "@/lib/utils";

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

const meta = {
  commit: { kind: "Pushed", icon: GitCommitHorizontal },
  article: { kind: "Published", icon: PenLine },
  featured: { kind: "Featured", icon: Star },
} as const;

interface ActivityFeedProps {
  items: ActivityItem[];
  /** Profile URL like https://github.com/ds-brandao — used to link commits. */
  githubUrl: string;
}

function rowClass() {
  return "grid grid-cols-[16px_1fr_auto] items-center gap-3.5 rounded-[8px] border-t border-border px-2 py-3 transition-all duration-300 ease-snap hover:bg-muted hover:pl-3.25";
}

export function ActivityFeed({ items, githubUrl }: ActivityFeedProps) {
  return (
    <div className="flex flex-col [&>div:last-child_a]:border-b [&>div:last-child_a]:border-b-border">
      {items.map((item, i) => {
        const { kind, icon: Icon } = meta[item.type];

        const body = (
          <>
            <Icon className="size-3.5 text-faint" strokeWidth={1.8} />
            <span className="min-w-0 truncate text-[14.5px] text-muted-foreground">
              <span className="mr-2.5 font-mono text-[10px] tracking-[0.13em] text-faint uppercase">
                {kind}
              </span>
              {item.type === "commit" && (
                <>
                  <span className="font-mono text-[13px] text-primary">
                    {item.repo}
                  </span>{" "}
                  {item.message}
                </>
              )}
              {item.type === "article" && item.title}
              {item.type === "featured" && (
                <>
                  {item.title} <span className="text-faint">· {item.source}</span>
                </>
              )}
            </span>
            <span className="font-mono text-xs whitespace-nowrap text-faint">
              {timeAgo(item.date)}
            </span>
          </>
        );

        const key =
          item.type === "commit"
            ? item.sha
            : item.type === "article"
              ? item.slug
              : item.url;

        return (
          <Reveal key={key} delay={(i % 6) * 55}>
            {item.type === "commit" ? (
              <a
                href={`${githubUrl}/${item.repo}/commit/${item.sha}`}
                target="_blank"
                rel="noopener noreferrer"
                className={rowClass()}
              >
                {body}
              </a>
            ) : item.type === "article" ? (
              <Link href={`/articles/${item.slug}`} className={rowClass()}>
                {body}
              </Link>
            ) : (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={rowClass()}
              >
                {body}
              </a>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}
