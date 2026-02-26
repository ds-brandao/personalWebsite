"use client";

import { motion } from "motion/react";
import type { ProjectAnalysis, ToolResult } from "@/types";
import {
  PackageInfo,
  PackageInfoContent,
  PackageInfoDependencies,
  PackageInfoDependency,
} from "@/components/ai-elements/package-info";
import { CodeBlock } from "@/components/ai-elements/code-block";
import {
  FileTree,
  FileTreeFolder,
  FileTreeFile,
} from "@/components/ai-elements/file-tree";
import {
  Snippet,
  SnippetInput,
  SnippetCopyButton,
} from "@/components/ai-elements/snippet";

interface ProjectDetailProps {
  analysis: ProjectAnalysis | null;
  repoUrl: string;
}

function renderToolResult(toolResult: ToolResult, index: number) {
  const { toolName, result } = toolResult;

  switch (toolName) {
    case "displayPackageInfo": {
      const r = result as {
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
    case "displayCodeSnippet": {
      const r = result as { code: string; language: string };
      return (
        <CodeBlock
          key={index}
          code={r.code}
          language={r.language as "typescript"}
        />
      );
    }
    case "displayFileStructure": {
      const r = result as { files?: { path: string; type: string }[] };
      return (
        <FileTree key={index}>
          {r.files?.map((f) =>
            f.type === "folder" ? (
              <FileTreeFolder key={f.path} path={f.path} name={f.path} />
            ) : (
              <FileTreeFile key={f.path} path={f.path} name={f.path} />
            )
          )}
        </FileTree>
      );
    }
    case "displaySetupCommand": {
      const r = result as { command: string };
      return (
        <Snippet key={index} code={r.command}>
          <SnippetInput />
          <SnippetCopyButton />
        </Snippet>
      );
    }
    default:
      return null;
  }
}

export function ProjectDetail({ analysis, repoUrl }: ProjectDetailProps) {
  if (!analysis) {
    return (
      <div className="text-text-secondary p-4">
        <p className="text-text-muted text-sm">
          AI analysis unavailable. Visit{" "}
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {analysis.toolResults.map((tr, i) => renderToolResult(tr, i))}
    </motion.div>
  );
}
