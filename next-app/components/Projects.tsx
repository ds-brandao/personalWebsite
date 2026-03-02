"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GitHubRepo, ProjectAnalysis, GitHubCommit } from "@/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectDetail } from "./ProjectDetail";
import { Separator } from "@/components/ui/separator";

interface ProjectsProps {
  repos: GitHubRepo[];
  analyses: Record<string, ProjectAnalysis>;
  commits: Record<string, GitHubCommit[]>;
}

export function Projects({ repos, analyses, commits }: ProjectsProps) {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);

  const handleSelect = (repo: GitHubRepo) => {
    setSelectedRepo(selectedRepo?.name === repo.name ? null : repo);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
      >
        Projects
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground mb-10 max-w-lg"
      >
        Open source work and side projects.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repos.map((repo) => (
          <ProjectCard
            key={repo.name}
            repo={repo}
            selected={selectedRepo?.name === repo.name}
            onClick={() => handleSelect(repo)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedRepo && (
          <motion.div
            key={selectedRepo.name}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Separator className="my-6" />
            <ProjectDetail
              repo={selectedRepo}
              analysis={analyses[selectedRepo.name]}
              commits={commits[selectedRepo.name] || []}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
