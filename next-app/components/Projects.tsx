"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { GitHubRepo } from "@/types";
import { ProjectCard } from "./ProjectCard";

interface ProjectsProps {
  repos: GitHubRepo[];
}

export function Projects({ repos }: ProjectsProps) {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);

  return (
    <div className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
      <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-8">
        Projects
      </h2>

      {/* Horizontal scroll - desktop */}
      <div className="hidden md:block overflow-x-auto pb-4 scrollbar-thin">
        <motion.div
          className="flex gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {repos.map((repo) => (
            <motion.div
              key={repo.id}
              variants={{
                hidden: { opacity: 0, x: 30 },
                visible: { opacity: 1, x: 0 },
              }}
            >
              <ProjectCard
                repo={repo}
                isSelected={selectedRepo?.id === repo.id}
                onClick={() =>
                  setSelectedRepo(
                    selectedRepo?.id === repo.id ? null : repo
                  )
                }
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Vertical stack - mobile */}
      <div className="md:hidden flex flex-col gap-4">
        {repos.map((repo) => (
          <ProjectCard
            key={repo.id}
            repo={repo}
            isSelected={selectedRepo?.id === repo.id}
            onClick={() =>
              setSelectedRepo(
                selectedRepo?.id === repo.id ? null : repo
              )
            }
          />
        ))}
      </div>

      {/* Detail panel placeholder - filled in Task 12 */}
      {selectedRepo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-8 bg-surface-1 rounded-xl border border-surface-3/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-semibold text-text-primary">
              {selectedRepo.name}
            </h3>
            <a
              href={selectedRepo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ember hover:text-ember-glow transition-colors"
            >
              View on GitHub →
            </a>
          </div>
          <p className="text-text-secondary">
            {selectedRepo.description || "No description available."}
          </p>
        </motion.div>
      )}
    </div>
  );
}
