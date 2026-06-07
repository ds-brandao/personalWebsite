"use client";

import { useState } from "react";
import { GitHubRepo, GitHubCommit } from "@/types";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { timeAgo } from "@/lib/utils";
import { motion } from "motion/react";

interface ProjectGridProps {
  repos: GitHubRepo[];
  commits: Record<string, GitHubCommit[]>;
}

function CommitRow({ commit }: { commit: GitHubCommit }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard
      ?.writeText(commit.sha)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      })
      .catch(() => {});
  };

  return (
    <div className="flex items-center gap-3 border-t border-dashed border-border-strong py-2.75 first:border-t-0">
      <button
        type="button"
        onClick={copy}
        title="Copy SHA"
        className="shrink-0 cursor-pointer font-mono text-xs text-primary"
      >
        {copied ? "copied!" : commit.sha.slice(0, 7)}
      </button>
      <span className="min-w-0 flex-1 truncate text-sm">{commit.message}</span>
      <span className="shrink-0 font-mono text-xs whitespace-nowrap text-faint">
        {timeAgo(commit.date)}
      </span>
    </div>
  );
}

function DetailPanel({
  repoName,
  commits,
}: {
  repoName: string;
  commits: GitHubCommit[];
}) {
  return (
    <div className="rounded-[14px] border border-border bg-muted p-5.5">
      <div className="mb-3 font-mono text-[10.5px] tracking-[0.12em] whitespace-nowrap text-faint uppercase">
        Latest commits · {repoName}
      </div>
      {commits.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent commits</p>
      ) : (
        commits.map((commit) => <CommitRow key={commit.sha} commit={commit} />)
      )}
    </div>
  );
}

export function ProjectGrid({ repos, commits }: ProjectGridProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const selectedIdx = repos.findIndex((r) => r.name === selected);

  const elements: React.ReactNode[] = [];

  repos.forEach((repo, i) => {
    elements.push(
      <Reveal key={repo.id} delay={(i % 6) * 55} className="h-full [&>div]:h-full">
        <ProjectCard
          repo={repo}
          isSelected={selected === repo.name}
          onSelect={() =>
            setSelected(selected === repo.name ? null : repo.name)
          }
        />
      </Reveal>
    );

    if (i === selectedIdx && selected) {
      elements.push(
        <motion.div
          key={`detail-${selected}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.25 }}
          className="col-span-full overflow-hidden"
        >
          <DetailPanel repoName={selected} commits={commits[selected] ?? []} />
        </motion.div>
      );
    }
  });

  return (
    <div className="grid grid-cols-1 gap-4.5 wide:grid-cols-2">{elements}</div>
  );
}
