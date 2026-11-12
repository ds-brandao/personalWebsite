import { ExternalLink } from "lucide-react";
import { App } from "@/types";
import { SkeletonImage } from "@/components/SkeletonImage";

/**
 * Showcase for a published app: icon, summary and store link beside a row of
 * phone screenshots that run off the bottom edge of the card.
 */
export function AppCard({ app }: { app: App }) {
  return (
    <article className="relative grid overflow-hidden rounded-[14px] border border-border bg-card shadow-[var(--shadow-soft)] wide:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col p-4 sm:p-5 wide:p-7">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-[22.5%] border border-border sm:size-12">
            <SkeletonImage
              src={app.icon}
              alt=""
              width={48}
              height={48}
              className="size-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-[clamp(14px,3.7vw,19px)] leading-tight font-semibold tracking-[-0.02em]">
              {app.name}
            </h3>
            <span className="text-[13px] text-faint sm:text-[13.5px]">
              {app.platform}
            </span>
          </div>
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.75 text-[13px] font-semibold tracking-[-0.01em] whitespace-nowrap text-primary-foreground transition-all duration-300 ease-snap hover:bg-[var(--primary-press)] hover:shadow-[0_8px_22px_-8px_var(--primary)] active:translate-y-px wide:absolute wide:top-5 wide:right-5"
          >
            <span className="sm:hidden">Get</span>
            <span className="hidden sm:inline">View on the App Store</span>
            <ExternalLink
              className="hidden size-3.25 sm:block"
              strokeWidth={2}
            />
          </a>
        </div>

        <p className="mt-3.5 max-w-[48ch] text-[14.5px] leading-normal text-pretty text-muted-foreground">
          {app.summary}
        </p>
      </div>

      <div className="relative h-40 overflow-hidden border-t border-border bg-bg-tint wide:h-auto wide:min-h-56 wide:border-t-0 wide:border-l">
        <span className="stripes" />
        <div className="absolute inset-x-0 top-5 flex justify-center gap-3 px-5 wide:top-16">
          {app.screenshots.map((shot, i) => (
            <div
              key={shot.src}
              className={`relative aspect-[1206/2622] w-[clamp(80px,24%,124px)] shrink-0 overflow-hidden rounded-[14%/6.5%] border border-border-strong shadow-[var(--shadow-deep)] ${i === 1 ? "" : "mt-5"}`}
            >
              <SkeletonImage
                src={shot.src}
                alt={shot.alt}
                loading="lazy"
                width={442}
                height={960}
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
