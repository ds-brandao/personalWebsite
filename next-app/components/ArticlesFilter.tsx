"use client";

import { useState } from "react";
import { Article } from "@/types";
import { ArticleCard } from "@/components/ArticleCard";
import { Toggle } from "@/components/ui/toggle";
import { motion, AnimatePresence } from "motion/react";

interface ArticlesFilterProps {
  articles: Article[];
  tags: string[];
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ArticlesFilter({ articles, tags }: ArticlesFilterProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? articles.filter((a) => a.tags.includes(activeTag))
    : articles;

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        <Toggle
          pressed={activeTag === null}
          onPressedChange={() => setActiveTag(null)}
          size="sm"
          className="rounded-full"
        >
          All
        </Toggle>
        {tags.map((tag) => (
          <Toggle
            key={tag}
            pressed={activeTag === tag}
            onPressedChange={() =>
              setActiveTag(activeTag === tag ? null : tag)
            }
            size="sm"
            className="rounded-full"
          >
            {tag}
          </Toggle>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((article) => (
            <motion.div
              key={article.title}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ArticleCard
                article={article}
                slug={slugify(article.title)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
