"use client";

import { Star } from "lucide-react";
import { GitHubRepo } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

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

interface ProjectCardProps {
  repo: GitHubRepo;
  selected: boolean;
  onClick: () => void;
}

export function ProjectCard({ repo, selected, onClick }: ProjectCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
        selected
          ? "border-l-4 border-l-primary border-t-border border-r-border border-b-border shadow-md"
          : "border-border hover:border-primary/40"
      }`}
    >
      <CardContent className="p-5">
        <h3 className="font-display text-base font-bold text-foreground">
          {repo.name}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {repo.description}
        </p>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: LANG_COLORS[repo.language] || "#7E6E5C" }}
              />
              {repo.language}
            </span>
          )}
          {repo.stargazers_count > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {repo.stargazers_count}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
