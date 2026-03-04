"use client";

import { useState } from "react";
import { Article } from "@/types";
import { ArticleCard } from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListFilter, X } from "lucide-react";
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
      <div className="flex items-center gap-3 mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ListFilter className="size-4" />
              {activeTag ?? "All Topics"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filter by topic</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={activeTag ?? "all"}
              onValueChange={(v) => setActiveTag(v === "all" ? null : v)}
            >
              <DropdownMenuRadioItem value="all">
                All Topics
              </DropdownMenuRadioItem>
              {tags.map((tag) => (
                <DropdownMenuRadioItem key={tag} value={tag}>
                  {tag}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {activeTag && (
          <Badge
            variant="secondary"
            className="gap-1 cursor-pointer"
            onClick={() => setActiveTag(null)}
          >
            {activeTag}
            <X className="size-3" />
          </Badge>
        )}

        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} {filtered.length === 1 ? "article" : "articles"}
        </span>
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
              className="h-full"
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
