"use client";

import { useState } from "react";
import { Config, Article, GitHubRepo } from "@/types";
import { EmberCanvas } from "./EmberCanvas";
import { LoadingScreen } from "./LoadingScreen";
import { SceneContainer } from "./SceneContainer";
import { DotNav } from "./DotNav";

interface PageClientProps {
  config: Config;
  articles: Article[];
  repos: GitHubRepo[];
}

export function PageClient({ config, articles, repos }: PageClientProps) {
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      <EmberCanvas className="fixed inset-0 z-0" />

      <main className="relative z-10">
        <SceneContainer id="hero">
          <div className="flex items-center justify-center h-full">
            <h1 className="font-display text-6xl font-bold gradient-text">
              {config.personal.name}
            </h1>
          </div>
        </SceneContainer>

        <SceneContainer id="articles" minHeight>
          <div className="px-6 py-20">
            <h2 className="font-display text-4xl font-bold text-text-primary mb-8">
              Writing
            </h2>
            <p className="text-text-secondary">
              Articles section — {articles.length} posts
            </p>
          </div>
        </SceneContainer>

        <SceneContainer id="projects" minHeight>
          <div className="px-6 py-20">
            <h2 className="font-display text-4xl font-bold text-text-primary mb-8">
              Projects
            </h2>
            <p className="text-text-secondary">
              Projects section — {repos.length} repos
            </p>
          </div>
        </SceneContainer>
      </main>

      <DotNav />
    </>
  );
}
