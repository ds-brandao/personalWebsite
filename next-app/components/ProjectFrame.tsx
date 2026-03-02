"use client";

import { Star, ExternalLink } from "lucide-react";
import { GitHubRepo } from "@/types";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

interface ProjectFrameProps {
  repo: GitHubRepo;
  selected: boolean;
  onClick: () => void;
}

export function ProjectFrame({ repo, selected, onClick }: ProjectFrameProps) {
  const langColor = repo.language ? LANG_COLORS[repo.language] || "#7E6E5C" : "#7E6E5C";

  return (
    <div
      onClick={onClick}
      className={`relative flex-shrink-0 w-[85vw] md:w-[70vw] h-full flex flex-col justify-end p-8 md:p-12 cursor-pointer rounded-2xl border transition-all duration-300 ${
        selected
          ? "border-primary bg-card shadow-lg"
          : "border-border/50 bg-card/50 hover:border-primary/40 hover:bg-card/80"
      }`}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-[0.04]"
        style={{ backgroundColor: langColor }}
      />

      <div className="relative z-10">
        <h3 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
          {repo.name}
        </h3>
        {repo.description && (
          <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-6 leading-relaxed">
            {repo.description}
          </p>
        )}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          {repo.language && (
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: langColor }}
              />
              {repo.language}
            </span>
          )}
          {repo.stargazers_count > 0 && (
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4" />
              {repo.stargazers_count}
            </span>
          )}
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
