"use client";

import { useState } from "react";
import { ArticleListItem } from "@/types";
import { ArticleCard } from "@/components/ArticleCard";
import { FeaturedCard, FEATURED_TAG } from "@/components/FeaturedCard";
import { motion, AnimatePresence } from "motion/react";

function tagsOf(entry: ArticleListItem): string[] {
  return entry.kind === "article" ? entry.article.tags : [FEATURED_TAG];
}

function keyOf(entry: ArticleListItem): string {
  return entry.kind === "article" ? entry.slug : entry.item.url;
}

export function ArticlesFilter({ items }: { items: ArticleListItem[] }) {
  const [activeTag, setActiveTag] = useState("All");

  const allTags = ["All", ...Array.from(new Set(items.flatMap(tagsOf)))];

  const filtered =
    activeTag === "All"
      ? items
      : items.filter((entry) => tagsOf(entry).includes(activeTag));

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
          {filtered.map((entry) => (
            <motion.div
              key={keyOf(entry)}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {entry.kind === "article" ? (
                <ArticleCard
                  article={entry.article}
                  slug={entry.slug}
                  readMinutes={entry.readMinutes}
                />
              ) : (
                <FeaturedCard item={entry.item} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
