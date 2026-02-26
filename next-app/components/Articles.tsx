"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Article, Config } from "@/types";
import { ArticleCard } from "./ArticleCard";

interface ArticlesProps {
  articles: Article[];
  tags: Config["tags"];
  onArticleClick: (article: Article) => void;
}

export function Articles({ articles, tags, onArticleClick }: ArticlesProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tagNames = Object.keys(tags);
  const filtered = activeTag
    ? articles.filter((a) => a.tags.includes(activeTag))
    : articles;

  return (
    <div className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
      <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-8">
        Writing
      </h2>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setActiveTag(null)}
          className={`tag-base ${
            activeTag === null
              ? "border-ember text-ember bg-ember/10"
              : "border-surface-3 text-text-muted hover:text-text-secondary hover:border-surface-3"
          }`}
        >
          All
        </button>
        {tagNames.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            className={`tag-base ${
              activeTag === tag
                ? "border-ember text-ember bg-ember/10"
                : "border-surface-3 text-text-muted hover:text-text-secondary hover:border-surface-3"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Bento grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((article, i) => (
            <motion.div
              key={article.title}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={i === 0 ? "md:col-span-2" : ""}
            >
              <ArticleCard
                article={article}
                featured={i === 0}
                onClick={() => onArticleClick(article)}
                tagColors={tags}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
