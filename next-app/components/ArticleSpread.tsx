"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Article, Config } from "@/types";

interface ArticleSpreadProps {
  article: Article;
  tags: Config["tags"];
  onClick: () => void;
}

export function ArticleSpread({ article, tags, onClick }: ArticleSpreadProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      onClick={onClick}
      className="group cursor-pointer grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10 items-center min-h-[60vh] py-16"
    >
      <div className="md:col-span-3 space-y-4">
        <h3 className="font-display text-3xl md:text-5xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
          {article.title}
        </h3>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
          {article.summary}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
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
      </div>

      {article.image && (
        <div className="md:col-span-2 relative overflow-hidden rounded-xl h-64 md:h-80">
          <motion.img
            src={article.image}
            alt={article.title}
            style={{
              y: imageY,
              ...(article.objectPosition ? { objectPosition: article.objectPosition } : {}),
            }}
            className="w-full h-[130%] object-cover absolute inset-0"
          />
        </div>
      )}
    </motion.div>
  );
}
