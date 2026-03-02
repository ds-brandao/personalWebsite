"use client";

import { motion } from "motion/react";
import { Article, Config } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface ArticleCardProps {
  article: Article;
  tags: Config["tags"];
  onClick: () => void;
  featured?: boolean;
}

export function ArticleCard({ article, tags, onClick, featured }: ArticleCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={onClick}
        className="group cursor-pointer overflow-hidden gap-0 py-0 border-border hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      >
        {article.image && (
          <div className={`relative overflow-hidden ${featured ? "h-64" : "h-44"}`}>
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              style={article.objectPosition ? { objectPosition: article.objectPosition } : undefined}
            />
          </div>
        )}
        <CardContent className="p-5">
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {article.summary}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => {
              const tagDef = tags[tag];
              return (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground border-l-2"
                  style={{ borderLeftColor: tagDef?.color || "var(--primary)" }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
