"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArticleListItem } from "@/types";
import { ArticleCard } from "@/components/ArticleCard";
import { FeaturedCard } from "@/components/FeaturedCard";

const controlClass =
  "grid size-9.5 cursor-pointer place-items-center rounded-full border border-border-strong text-muted-foreground transition-all duration-300 ease-snap hover:border-primary-line hover:text-primary active:scale-90 disabled:pointer-events-none disabled:opacity-35";

/**
 * Horizontally scrolling row of article cards that snap into place, with
 * previous and next buttons that move one card at a time.
 */
export function ArticleCarousel({ items }: { items: ArticleListItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateScrollState = () => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollBack(track.scrollLeft > 1);
    setCanScrollForward(
      track.scrollLeft + track.clientWidth < track.scrollWidth - 1
    );
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.firstElementChild;
    if (!track || !card) return;
    const gapPx = parseFloat(getComputedStyle(track).columnGap) || 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    track.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gapPx),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={updateScrollState}
        tabIndex={0}
        aria-label="Articles"
        className="-my-5 flex snap-x snap-mandatory gap-5.5 overflow-x-auto rounded-[14px] py-5 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&::-webkit-scrollbar]:hidden"
      >
        {items.map((entry) => (
          <div
            key={entry.kind === "article" ? entry.slug : entry.item.url}
            className="shrink-0 basis-[85%] snap-start sm:basis-[60%] wide:basis-[calc((100%-22px)/2.2)]"
          >
            {entry.kind === "article" ? (
              <ArticleCard
                article={entry.article}
                slug={entry.slug}
                readMinutes={entry.readMinutes}
              />
            ) : (
              <FeaturedCard item={entry.item} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end gap-2.5">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          disabled={!canScrollBack}
          aria-label="Previous articles"
          className={controlClass}
        >
          <ChevronLeft className="size-4.5" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          disabled={!canScrollForward}
          aria-label="Next articles"
          className={controlClass}
        >
          <ChevronRight className="size-4.5" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
