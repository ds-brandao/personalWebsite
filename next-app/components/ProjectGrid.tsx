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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { GitCommitIcon, PackageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProjectGridProps {
  repos: GitHubRepo[];
  commits: Record<string, GitHubCommit[]>;
  analyses: Record<string, ProjectAnalysis>;
}

function DependenciesList({ analysis }: { analysis: ProjectAnalysis }) {
  const pkgInfo = analysis.toolResults.find(
    (t) => t.toolName === "displayPackageInfo"
  );
  if (!pkgInfo) return <p className="text-sm text-muted-foreground">No dependency info available</p>;

  const result = pkgInfo.result as {
    name: string;
    currentVersion: string;
    description: string;
    dependencies: { name: string; version: string }[];
  };

  return (
    <div className="space-y-3">
      {result.description && (
        <p className="text-sm text-muted-foreground">{result.description}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {result.dependencies.map((dep) => (
          <Badge key={dep.name} variant="secondary" className="font-mono text-xs">
            {dep.name}
            <span className="ml-1 text-muted-foreground">{dep.version}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
}

function CommitsList({ commits }: { commits: GitHubCommit[] }) {
  if (commits.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent commits</p>;
  }

  return (
    <div className="space-y-3">
      {commits.map((commit) => (
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
    </div>
  );
}

function DetailPanel({
  repo,
  commits,
  analysis,
}: {
  repo: GitHubRepo;
  commits: GitHubCommit[];
  analysis?: ProjectAnalysis;
}) {
  const hasDeps = analysis?.toolResults.some(
    (t) => t.toolName === "displayPackageInfo"
  );

  return (
    <Card>
      <CardContent className="pt-4">
        <Tabs defaultValue="commits">
          <TabsList className="mb-4">
            <TabsTrigger value="commits">
              <GitCommitIcon className="size-3.5" />
              Commits
            </TabsTrigger>
            {hasDeps && (
              <TabsTrigger value="deps">
                <PackageIcon className="size-3.5" />
                Dependencies
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="commits">
            <CommitsList commits={commits} />
          </TabsContent>

          {hasDeps && analysis && (
            <TabsContent value="deps">
              <DependenciesList analysis={analysis} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function ProjectGrid({ repos, commits, analyses }: ProjectGridProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedIdx = repos.findIndex((r) => r.name === selected);
  const selectedRepo = selectedIdx >= 0 ? repos[selectedIdx] : undefined;

  const elements: React.ReactNode[] = [];

  repos.forEach((repo, i) => {
    elements.push(
      <ProjectCard
        key={repo.id}
        repo={repo}
        isSelected={selected === repo.name}
        onSelect={() =>
          setSelected(selected === repo.name ? null : repo.name)
        }
      />
    );

    if (i === selectedIdx && selectedRepo) {
      elements.push(
        <AnimatePresence key={`detail-${selected}`}>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="col-span-full overflow-hidden"
          >
            <DetailPanel
              repo={selectedRepo}
              commits={commits[selected!] ?? []}
              analysis={analyses[selected!]}
            />
          </motion.div>
        </AnimatePresence>
      );
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {elements}
    </div>
  );
}
