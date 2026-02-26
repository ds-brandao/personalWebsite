"use client";

import { motion } from "motion/react";
import { GitHubRepo } from "@/types";
import { Star } from "lucide-react";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572a5",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Dockerfile: "#384d54",
};

interface ProjectCardProps {
  repo: GitHubRepo;
  isSelected: boolean;
  onClick: () => void;
}

export function ProjectCard({ repo, isSelected, onClick }: ProjectCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`cursor-pointer flex-shrink-0 w-[300px] bg-surface-1 rounded-xl p-5 border transition-all duration-300 ${
        isSelected
          ? "border-ember shadow-[0_0_20px_rgba(249,115,22,0.2)]"
          : "border-surface-3/50 hover:border-ember/30"
      }`}
      whileHover={{ scale: 1.03 }}
    >
      <h3 className="font-display font-semibold text-lg text-text-primary mb-2 truncate">
        {repo.name}
      </h3>

      <p className="text-text-secondary text-sm line-clamp-3 mb-4 min-h-[3.75rem]">
        {repo.description || "No description"}
      </p>

      <div className="flex items-center justify-between">
        {repo.language && (
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: LANG_COLORS[repo.language] || "#78716c",
              }}
            />
            <span className="text-text-muted text-xs">{repo.language}</span>
          </div>
        )}

        {repo.stargazers_count > 0 && (
          <div className="flex items-center gap-1 text-text-muted text-xs">
            <Star size={12} />
            <span>{repo.stargazers_count}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
