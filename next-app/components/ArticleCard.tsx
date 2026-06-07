import Link from "next/link";
import { Clock } from "lucide-react";
import { Article } from "@/types";
import { SkeletonImage } from "@/components/SkeletonImage";
import { formatDate } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  slug: string;
  readMinutes?: number | null;
}

function toThumb(src: string): string {
  return src
    .replace("/images/blog/", "/images/blog/thumbs/")
    .replace(/\.(jpeg|jpg|png)$/i, ".webp");
}

export function ArticleCard({ article, slug, readMinutes }: ArticleCardProps) {
  return (
    <Link
      href={`/articles/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-border bg-card shadow-[var(--shadow-soft)] transition-all duration-400 ease-snap hover:-translate-y-1 hover:border-border-strong hover:shadow-[var(--shadow-deep)]"
    >
      {article.image && (
        <div className="relative aspect-video w-full shrink-0 overflow-hidden border-b border-border bg-muted">
          <SkeletonImage
            src={toThumb(article.image)}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-600 ease-snap group-hover:scale-104"
            style={
              article.objectPosition
                ? { objectPosition: article.objectPosition }
                : undefined
            }
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2.75 p-5">
        <div className="flex items-center gap-2.5 font-mono text-[11.5px] text-faint">
          <span>{formatDate(article.date)}</span>
          {readMinutes != null && (
            <>
              <span className="size-0.75 rounded-full bg-faint" />
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.25" strokeWidth={1.7} /> {readMinutes} min
              </span>
            </>
          )}
        </div>
        <h3 className="font-display text-[19px] leading-tight font-semibold tracking-[-0.02em] text-balance transition-colors duration-200 group-hover:text-primary">
          {article.title}
        </h3>
        <p className="flex-1 text-sm leading-normal text-pretty text-muted-foreground">
          {article.summary}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
