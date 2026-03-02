"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Article, Config } from "@/types";
import { ArticleCard } from "./ArticleCard";
import { Toggle } from "@/components/ui/toggle";

interface ArticlesProps {
  articles: Article[];
  tags: Config["tags"];
  onArticleClick: (article: Article) => void;
}

export function Articles({ articles, tags, onArticleClick }: ArticlesProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? articles.filter((a) => a.tags.includes(activeTag))
    : articles;

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
      >
        Writing
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground mb-8 max-w-lg"
      >
        Thoughts on software engineering, security, and building things.
      </motion.p>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2 mb-10">
        <Toggle
          pressed={activeTag === null}
          onPressedChange={() => setActiveTag(null)}
          className="rounded-full text-xs"
          size="sm"
        >
          All
        </Toggle>
        {Object.entries(tags).map(([key]) => (
          <Toggle
            key={key}
            pressed={activeTag === key}
            onPressedChange={() => setActiveTag(activeTag === key ? null : key)}
            className="rounded-full text-xs"
            size="sm"
          >
            {key}
          </Toggle>
        ))}
      </div>

      {/* Masonry-style grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((article, i) => (
            <div key={article.title} className="break-inside-avoid">
              <ArticleCard
                article={article}
                tags={tags}
                onClick={() => onArticleClick(article)}
                featured={i === 0 && !activeTag}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
