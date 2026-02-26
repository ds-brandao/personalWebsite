"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "motion/react";
import { GitHubRepo } from "@/types";
import type { ChatMessage } from "@/app/api/chat/route";
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
import { Snippet, SnippetInput, SnippetCopyButton } from "@/components/ai-elements/snippet";

interface ProjectDetailProps {
  repo: GitHubRepo;
}

const transport = new DefaultChatTransport({ api: "/api/chat" });

export function ProjectDetail({ repo }: ProjectDetailProps) {
  const { messages, sendMessage, status, error } = useChat<ChatMessage>({
    transport,
    id: `project-${repo.id}`,
  });
  const hasSent = useRef(false);
  const lastRepoId = useRef<number | null>(null);

  useEffect(() => {
    if (lastRepoId.current === repo.id) return;
    lastRepoId.current = repo.id;
    hasSent.current = false;
  }, [repo.id]);

  useEffect(() => {
    if (hasSent.current) return;
    hasSent.current = true;

    sendMessage({
      text: `Analyze this GitHub project and display rich UI components for it:
- Name: ${repo.name}
- Description: ${repo.description || "No description"}
- Language: ${repo.language || "Unknown"}
- Stars: ${repo.stargazers_count}
- URL: ${repo.html_url}`,
    });
  }, [repo, sendMessage]);

  const isLoading = status === "streaming" || status === "submitted";

  if (error) {
    return (
      <div className="text-text-secondary p-4">
        <p className="text-text-muted text-sm">
          AI analysis unavailable. Visit{" "}
          <a
            href={repo.html_url}
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
    <AnimatePresence mode="wait">
      <motion.div
        key={repo.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-4"
      >
        {isLoading && messages.length <= 1 && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-surface-2 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {messages
          .filter((m) => m.role === "assistant")
          .map((message) =>
            message.parts?.map((part, i) => {
              if (part.type === "text" && part.text.trim()) {
                return (
                  <p
                    key={`${message.id}-text-${i}`}
                    className="text-text-secondary text-sm"
                  >
                    {part.text}
                  </p>
                );
              }

              // Handle tool invocation parts
              if (part.type === "tool-displayPackageInfo") {
                if (part.state !== "output-available") return null;
                const result = part.output;
                return (
                  <PackageInfo
                    key={`${message.id}-${i}`}
                    name={result.name}
                  >
                    <PackageInfoContent>
                      <PackageInfoDependencies>
                        {result.dependencies?.map(
                          (dep: { name: string; version?: string }) => (
                            <PackageInfoDependency
                              key={dep.name}
                              name={dep.name}
                              version={dep.version || "latest"}
                            />
                          )
                        )}
                      </PackageInfoDependencies>
                    </PackageInfoContent>
                  </PackageInfo>
                );
              }

              if (part.type === "tool-displayCodeSnippet") {
                if (part.state !== "output-available") return null;
                const result = part.output;
                return (
                  <CodeBlock
                    key={`${message.id}-${i}`}
                    code={result.code}
                    language={result.language as "typescript"}
                  />
                );
              }

              if (part.type === "tool-displayFileStructure") {
                if (part.state !== "output-available") return null;
                const result = part.output;
                return (
                  <FileTree key={`${message.id}-${i}`}>
                    {result.files?.map(
                      (f: { path: string; type: string }) =>
                        f.type === "folder" ? (
                          <FileTreeFolder
                            key={f.path}
                            path={f.path}
                            name={f.path}
                          />
                        ) : (
                          <FileTreeFile
                            key={f.path}
                            path={f.path}
                            name={f.path}
                          />
                        )
                    )}
                  </FileTree>
                );
              }

              if (part.type === "tool-displaySetupCommand") {
                if (part.state !== "output-available") return null;
                const result = part.output;
                return (
                  <Snippet key={`${message.id}-${i}`} code={result.command}>
                    <SnippetInput />
                    <SnippetCopyButton />
                  </Snippet>
                );
              }

              return null;
            })
          )}
      </motion.div>
    </AnimatePresence>
  );
}
