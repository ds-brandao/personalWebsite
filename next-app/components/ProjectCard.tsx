import { Card, CardContent } from "@/components/ui/card";
import { Star, ExternalLink } from "lucide-react";
import { GitHubRepo } from "@/types";
import { cn } from "@/lib/utils";

const langColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Shell: "#89e051",
  HCL: "#844FBA",
};

interface ProjectCardProps {
  repo: GitHubRepo;
  isSelected: boolean;
  onSelect: () => void;
}

export function ProjectCard({ repo, isSelected, onSelect }: ProjectCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-mono text-sm font-semibold text-foreground">
            {repo.name}
          </h3>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>
        {repo.description && (
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
            {repo.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          {repo.language && (
            <span className="flex items-center gap-1">
              <span
                className="size-2.5 rounded-full"
                style={{
                  backgroundColor: langColors[repo.language] ?? "var(--muted-foreground)",
                }}
              />
              {repo.language}
            </span>
          )}
          {repo.stargazers_count > 0 && (
            <span className="flex items-center gap-1">
              <Star className="size-3" />
              {repo.stargazers_count}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
