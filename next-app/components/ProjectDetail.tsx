"use client";

import { motion } from "motion/react";
import type { ProjectAnalysis, ToolResult, GitHubCommit } from "@/types";
import {
  PackageInfo,
  PackageInfoContent,
  PackageInfoDependencies,
  PackageInfoDependency,
} from "@/components/ai-elements/package-info";
import {
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

interface ProjectDetailProps {
  analysis: ProjectAnalysis | null;
  repoUrl: string;
  commits: GitHubCommit[];
}

function renderPackageInfo(toolResult: ToolResult, index: number) {
  if (toolResult.toolName !== "displayPackageInfo") return null;

  const r = toolResult.result as {
    name: string;
    dependencies?: { name: string; version?: string }[];
  };

  return (
    <PackageInfo key={index} name={r.name}>
      <PackageInfoContent>
        <PackageInfoDependencies>
          {r.dependencies?.map((dep) => (
            <PackageInfoDependency
              key={dep.name}
              name={dep.name}
              version={dep.version || "latest"}
            />
          ))}
        </PackageInfoDependencies>
      </PackageInfoContent>
    </PackageInfo>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProjectDetail({
  analysis,
  repoUrl,
  commits,
}: ProjectDetailProps) {
  if (!analysis && commits.length === 0) {
    return (
      <div className="text-text-secondary p-4">
        <p className="text-text-muted text-sm">
          No data available. Visit{" "}
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember hover:text-ember-glow"
          >
            GitHub
          </a>{" "}
          for details.
        </p>
      </div>
    );
  }

  const packageInfoResult = analysis?.toolResults.find(
    (tr) => tr.toolName === "displayPackageInfo"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {packageInfoResult && renderPackageInfo(packageInfoResult, 0)}

      {commits.length > 0 && (
        <div className="space-y-2">
          <span className="font-medium text-text-muted text-xs uppercase tracking-wide">
            Recent Commits
          </span>
          <div className="space-y-2">
            {commits.map((commit) => (
              <div
                key={commit.sha}
                className="rounded-lg border bg-background"
              >
                <div className="flex items-center justify-between gap-4 p-3">
                  <CommitAuthor>
                    <CommitAuthorAvatar
                      initials={getInitials(commit.authorName)}
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
