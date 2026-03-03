"use client";

import { useState } from "react";
import { GitHubRepo, GitHubCommit } from "@/types";
import type { ProjectAnalysis } from "@/types";
import { ProjectCard } from "@/components/ProjectCard";
import {
  Commit,
  CommitHeader,
  CommitAuthor,
  CommitAuthorAvatar,
  CommitInfo,
  CommitMessage,
  CommitMetadata,
  CommitHash,
  CommitSeparator,
  CommitTimestamp,
  CommitActions,
  CommitCopyButton,
} from "@/components/ai-elements/commit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "motion/react";

interface ProjectGridProps {
  repos: GitHubRepo[];
  commits: Record<string, GitHubCommit[]>;
  analyses: Record<string, ProjectAnalysis>;
}

export function ProjectGrid({ repos, commits, analyses }: ProjectGridProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRepo = repos.find((r) => r.name === selected);
  const selectedCommits = selected ? commits[selected] ?? [] : [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {repos.map((repo) => (
          <ProjectCard
            key={repo.id}
            repo={repo}
            isSelected={selected === repo.name}
            onSelect={() =>
              setSelected(selected === repo.name ? null : repo.name)
            }
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedRepo && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-base">
                  {selectedRepo.name}
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-3">
                {selectedCommits.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No recent commits
                  </p>
                )}
                {selectedCommits.map((commit) => (
                  <Commit key={commit.sha}>
                    <CommitHeader>
                      <CommitAuthor>
                        <CommitAuthorAvatar
                          initials={commit.authorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                          className="mr-3"
                        />
                        <CommitInfo>
                          <CommitMessage>{commit.message}</CommitMessage>
                          <CommitMetadata>
                            <CommitHash>{commit.sha.slice(0, 7)}</CommitHash>
                            <CommitSeparator />
                            <CommitTimestamp date={new Date(commit.date)} />
                          </CommitMetadata>
                        </CommitInfo>
                      </CommitAuthor>
                      <CommitActions>
                        <CommitCopyButton hash={commit.sha} />
                      </CommitActions>
                    </CommitHeader>
                  </Commit>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
