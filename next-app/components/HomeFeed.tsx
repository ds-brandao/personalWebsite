"use client";

import { GitHubCommit } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";

interface HomeFeedProps {
  commits: Record<string, GitHubCommit[]>;
}

export function HomeFeed({ commits }: HomeFeedProps) {
  // Flatten and sort all commits by date (most recent first)
  const allCommits = Object.entries(commits)
    .flatMap(([repo, repoCommits]) =>
      repoCommits.map((c) => ({ ...c, repo }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-3">
      {allCommits.map((commit, i) => (
        <motion.div
          key={commit.sha}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <Commit>
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
                  <div className="flex items-center gap-2">
                    <CommitMessage>{commit.message}</CommitMessage>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {commit.repo}
                    </Badge>
                  </div>
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
        </motion.div>
      ))}
    </div>
  );
}
