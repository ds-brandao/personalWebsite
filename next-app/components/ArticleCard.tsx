"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  onClick: () => void;
  tagColors: Record<string, { color: string }>;
}

const TAG_COLOR_MAP: Record<string, string> = {
  security: "border-red-500/40 text-red-400 bg-red-500/10",
  coding: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  ai: "border-purple-500/40 text-purple-400 bg-purple-500/10",
  tutorial: "border-green-500/40 text-green-400 bg-green-500/10",
  project: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  intro: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
  celery: "border-lime-500/40 text-lime-400 bg-lime-500/10",
  "ci/cd": "border-orange-500/40 text-orange-400 bg-orange-500/10",
  "home lab": "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",
  "systems integration": "border-teal-500/40 text-teal-400 bg-teal-500/10",
  life: "border-pink-500/40 text-pink-400 bg-pink-500/10",
};

export function ArticleCard({
  article,
  featured,
  onClick,
  tagColors,
}: ArticleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rotateX: -y * 10, rotateY: x * 10 });
  };

  const handleMouseLeave = () => setTilt({ rotateX: 0, rotateY: 0 });

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`cursor-pointer bg-surface-1 rounded-xl overflow-hidden border border-surface-3/50 hover:border-ember/30 transition-colors ${
        featured ? "md:col-span-2" : ""
      }`}
      style={{
        perspective: "1000px",
        transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div
        className={`w-full overflow-hidden ${featured ? "h-56" : "h-40"}`}
      >
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
          style={{
            objectPosition: article.objectPosition || "center",
          }}
        />
      </div>

      <div className="p-5">
        <h3 className="font-display font-semibold text-lg text-text-primary mb-2 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-text-secondary text-sm line-clamp-2 mb-4">
          {article.summary}
        </p>
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => {
            const colorKey = tagColors[tag]?.color || "";
            const classes =
              TAG_COLOR_MAP[colorKey] ||
              "border-text-muted/40 text-text-muted bg-surface-2";
            return (
              <span key={tag} className={`tag-base ${classes}`}>
                {tag}
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
