"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { GitHubRepo, ProjectAnalysis, GitHubCommit } from "@/types";
import { ProjectFrame } from "./ProjectFrame";
import { ProjectDetail } from "./ProjectDetail";

interface ProjectsProps {
  repos: GitHubRepo[];
  analyses: Record<string, ProjectAnalysis>;
  commits: Record<string, GitHubCommit[]>;
}

export function Projects({ repos, analyses, commits }: ProjectsProps) {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalFrames = repos.length + 1; // +1 for the title frame
  const containerHeight = `${(totalFrames + 1) * 100}vh`;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `${-((totalFrames - 1) / totalFrames) * 100}%`]
  );

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const handleSelect = (repo: GitHubRepo) => {
    setSelectedRepo(selectedRepo?.name === repo.name ? null : repo);
  };

  return (
    <div ref={containerRef} style={{ height: containerHeight }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        {/* Scrolling track */}
        <div className="flex-1 flex items-center">
          <motion.div
            style={{ x }}
            className="flex gap-6 px-6"
          >
            {/* Title frame */}
            <div className="flex-shrink-0 w-[85vw] md:w-[70vw] h-[70vh] flex flex-col justify-center">
              <h2 className="font-display text-5xl md:text-8xl font-bold text-foreground mb-4">
                Projects
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-md">
                Open source work and side projects.
              </p>
            </div>

            {/* Project frames */}
            {repos.map((repo) => (
              <ProjectFrame
                key={repo.name}
                repo={repo}
                selected={selectedRepo?.name === repo.name}
                onClick={() => handleSelect(repo)}
              />
            ))}
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-border/30 mx-6 mb-6 rounded-full overflow-hidden">
          <motion.div
            style={{ width: progressWidth }}
            className="h-full bg-primary rounded-full"
          />
        </div>

        {/* Expanded project detail */}
        <AnimatePresence>
          {selectedRepo && (
            <motion.div
              key={selectedRepo.name}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-md max-h-[40vh]"
            >
              <div className="p-6 overflow-y-auto max-h-[38vh]">
                <ProjectDetail
                  repo={selectedRepo}
                  analysis={analyses[selectedRepo.name]}
                  commits={commits[selectedRepo.name] || []}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
