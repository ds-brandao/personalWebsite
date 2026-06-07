"use client";

import { ArrowRight, BookMarked, GitFork, Star } from "lucide-react";
import { GitHubRepo } from "@/types";
import { timeAgo } from "@/lib/utils";

interface ProjectCardProps {
  repo: GitHubRepo;
  isSelected: boolean;
  onSelect: () => void;
}

export function ProjectCard({ repo, isSelected, onSelect }: ProjectCardProps) {
  // Mouse-tracked glow: feed the cursor x position to the radial gradient
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  };

  return (
    <div
      onMouseMove={onMouseMove}
      onClick={onSelect}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[14px] border border-border bg-card p-5.5 shadow-[var(--shadow-soft)] transition-all duration-400 ease-snap hover:-translate-y-1 hover:border-border-strong hover:shadow-[var(--shadow-deep)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx, 50%) -20%, var(--primary-soft), transparent 70%)",
        }}
      />

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5 font-mono text-[15px] font-semibold tracking-[-0.01em] whitespace-nowrap">
          <BookMarked className="size-3.75 shrink-0 text-faint" strokeWidth={1.7} />
          <span className="overflow-hidden text-ellipsis">{repo.name}</span>
        </div>
        <span className="flex shrink-0 items-center gap-3 font-mono text-[12.5px] whitespace-nowrap text-faint">
          <span className="inline-flex items-center gap-1.25">
            <Star className="size-3.25" strokeWidth={1.6} /> {repo.stargazers_count}
          </span>
          <span className="inline-flex items-center gap-1.25">
            <GitFork className="size-3.25" strokeWidth={1.6} /> {repo.forks_count}
          </span>
        </span>
      </div>

      {repo.topics && repo.topics.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 3).map((topic) => (
            <span className="tag" key={topic}>
              {topic}
            </span>
          ))}
        </div>
      )}

      <p className="mb-4.5 flex-1 text-[14.5px] leading-normal text-pretty text-muted-foreground">
        {repo.description}
      </p>

      <div className="flex items-center gap-3.5 font-mono text-[12.5px] whitespace-nowrap text-faint">
        {repo.language && (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.25 rounded-full bg-primary" />
            {repo.language}
          </span>
        )}
        {repo.pushed_at && (
          <span suppressHydrationWarning>{timeAgo(repo.pushed_at)}</span>
        )}
        <button
          type="button"
          aria-expanded={isSelected}
          onClick={(e) => {
            e.stopPropagation(); // the card's onClick also toggles
            onSelect();
          }}
          className="ml-auto inline-flex cursor-pointer items-center gap-1.25 text-primary"
        >
          {isSelected ? "Hide" : "Commits"}
          <ArrowRight
            className="size-3.75 transition-transform duration-300 ease-snap"
            strokeWidth={1.9}
            style={{ transform: isSelected ? "rotate(90deg)" : "none" }}
          />
        </button>
      </div>
    </div>
  );
}
