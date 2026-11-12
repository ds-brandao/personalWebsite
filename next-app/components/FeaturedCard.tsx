import { ArrowUpRight } from "lucide-react";
import { FeaturedItem } from "@/types";
import { SkeletonImage } from "@/components/SkeletonImage";
import { formatDate } from "@/lib/utils";

export const FEATURED_TAG = "Featured";

/**
 * Card for an outside article the site owner was featured in.
 *
 * Matches ArticleCard's layout but opens the source site in a new tab, with the
 * source's name set over the cover image.
 */
export function FeaturedCard({ item }: { item: FeaturedItem }) {
  const host = new URL(item.url).hostname;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-border bg-card shadow-[var(--shadow-soft)] transition-all duration-400 ease-snap hover:-translate-y-1 hover:border-border-strong hover:shadow-[var(--shadow-deep)]"
    >
      <div className="relative flex aspect-video w-full shrink-0 flex-col justify-end overflow-hidden border-b border-border bg-muted p-6">
        <SkeletonImage
          src={item.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-600 ease-snap group-hover:scale-104"
          style={
            item.objectPosition
              ? { objectPosition: item.objectPosition }
              : undefined
          }
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <span className="relative text-[13px] text-white/75">Featured in</span>
        <span className="relative font-display text-[clamp(30px,4.2vw,44px)] leading-none font-semibold tracking-[-0.035em] text-white">
          {item.source}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.75 p-5">
        <div className="flex items-center gap-2.5 font-mono text-[11.5px] text-faint">
          <span>{formatDate(item.date)}</span>
          <span className="size-0.75 rounded-full bg-faint" />
          <span className="inline-flex items-center gap-0.5">
            {host}
            <ArrowUpRight className="size-3.25" strokeWidth={1.7} />
          </span>
        </div>
        <h3 className="font-display text-[19px] leading-tight font-semibold tracking-[-0.02em] text-balance transition-colors duration-200 group-hover:text-primary">
          {item.title}
        </h3>
        <p className="flex-1 text-sm leading-normal text-pretty text-muted-foreground">
          {item.summary}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className="tag">{FEATURED_TAG}</span>
        </div>
      </div>
    </a>
  );
}
