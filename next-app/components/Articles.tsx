"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Article, Config } from "@/types";
import { ArticleSpread } from "./ArticleSpread";
import { ScrollRevealText } from "./ScrollRevealText";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

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
      <ScrollRevealText
        text="Writing"
        as="h2"
        className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4"
      />
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground mb-10 max-w-lg text-lg"
      >
        Thoughts on software engineering, security, and building things.
      </motion.p>

      {/* Tag filters — sticky below navbar */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md py-4 -mx-6 px-6 mb-6">
        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Editorial article spreads */}
      <div>
        <AnimatePresence mode="popLayout">
          {filtered.map((article, i) => (
            <motion.div
              key={article.title}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArticleSpread
                article={article}
                tags={tags}
                onClick={() => onArticleClick(article)}
              />
              {i < filtered.length - 1 && <Separator className="my-0" />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
