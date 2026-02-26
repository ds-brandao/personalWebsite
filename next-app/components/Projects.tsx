"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GitHubRepo, ProjectAnalysis } from "@/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectDetail } from "./ProjectDetail";

interface ProjectsProps {
  repos: GitHubRepo[];
  analyses: Record<string, ProjectAnalysis>;
}

export function Projects({ repos, analyses }: ProjectsProps) {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(
    repos[0] ?? null
  );

  const analysis = selectedRepo ? analyses[selectedRepo.name] ?? null : null;

  return (
    <div className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
      <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-8">
        Projects
      </h2>

      {/* Horizontal scroll - desktop */}
      <div className="hidden md:block overflow-x-auto overflow-y-visible pb-4 scrollbar-thin">
        <motion.div
          className="flex gap-6 p-3"
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
                onClick={() => setSelectedRepo(repo)}
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
            onClick={() => setSelectedRepo(repo)}
          />
        ))}
      </div>

      {/* AI-powered detail panel */}
      <AnimatePresence mode="wait">
        {selectedRepo && (
          <motion.div
            key={selectedRepo.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
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
                View on GitHub &rarr;
              </a>
            </div>
            <ProjectDetail
              analysis={analysis}
              repoUrl={selectedRepo.html_url}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
