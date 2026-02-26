"use client";

import { useState } from "react";
import { Config, Article, GitHubRepo, ProjectAnalysis } from "@/types";
import { EmberCanvas } from "./EmberCanvas";
import { LoadingScreen } from "./LoadingScreen";
import { SceneContainer } from "./SceneContainer";
import { Hero } from "./Hero";
import { Articles } from "./Articles";
import { Projects } from "./Projects";
import { ArticleModal } from "./ArticleModal";
import { DotNav } from "./DotNav";
import { Footer } from "./Footer";
import { PenguinCompanion } from "./penguin";

interface PageClientProps {
  config: Config;
  articles: Article[];
  repos: GitHubRepo[];
  analyses: Record<string, ProjectAnalysis>;
}

export function PageClient({ config, articles, repos, analyses }: PageClientProps) {
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      <EmberCanvas className="fixed inset-0 z-0" />
      <PenguinCompanion />

      <main className="relative z-10">
        <SceneContainer id="hero">
          <Hero config={config} />
        </SceneContainer>

        <SceneContainer id="articles" minHeight>
          <Articles
            articles={articles}
            tags={config.tags}
            onArticleClick={setSelectedArticle}
          />
        </SceneContainer>

        <SceneContainer id="projects" minHeight>
          <Projects repos={repos} analyses={analyses} />
        </SceneContainer>

        <Footer config={config} />
      </main>

      <DotNav />

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </>
  );
}
