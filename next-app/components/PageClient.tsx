"use client";

import { useState } from "react";
import { Config, Article, GitHubRepo, ProjectAnalysis, GitHubCommit } from "@/types";
import { SporeCanvas } from "./SporeCanvas";
import { LoadingScreen } from "./LoadingScreen";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Articles } from "./Articles";
import { Projects } from "./Projects";
import { ArticleModal } from "./ArticleModal";
import { Footer } from "./Footer";
import { PenguinCompanion } from "./penguin";

interface PageClientProps {
  config: Config;
  articles: Article[];
  repos: GitHubRepo[];
  analyses: Record<string, ProjectAnalysis>;
  commits: Record<string, GitHubCommit[]>;
}

export function PageClient({ config, articles, repos, analyses, commits }: PageClientProps) {
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      <SporeCanvas className="fixed inset-0 z-0 pointer-events-none" />
      <PenguinCompanion />

      <Navbar name={config.personal.name} />

      <main className="relative z-10 paper-grain">
        <div id="hero">
          <Hero config={config} />
        </div>

        <div id="articles">
          <Articles
            articles={articles}
            tags={config.tags}
            onArticleClick={setSelectedArticle}
          />
        </div>

        <div id="projects">
          <Projects repos={repos} analyses={analyses} commits={commits} />
        </div>

        <Footer config={config} />
      </main>

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </>
  );
}
