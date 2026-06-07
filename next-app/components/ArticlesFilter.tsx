"use client";

import { useState } from "react";
import { Article } from "@/types";
import { ArticleCard } from "@/components/ArticleCard";
import { motion, AnimatePresence } from "motion/react";

export interface ArticleListItem {
  article: Article;
  slug: string;
  readMinutes: number | null;
}

export function ArticlesFilter({ items }: { items: ArticleListItem[] }) {
  const [activeTag, setActiveTag] = useState("All");

  const allTags = [
    "All",
    ...Array.from(new Set(items.flatMap(({ article }) => article.tags))),
  ];

  const filtered =
    activeTag === "All"
      ? items
      : items.filter(({ article }) => article.tags.includes(activeTag));

  return (
    <>
      <div className="mb-7 flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`tag${activeTag === tag ? " on" : ""}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5.5 wide:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map(({ article, slug, readMinutes }) => (
            <motion.div
              key={slug}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ArticleCard
                article={article}
                slug={slug}
                readMinutes={readMinutes}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
