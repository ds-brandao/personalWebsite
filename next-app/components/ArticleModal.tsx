"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Article } from "@/types";
import { Mermaid } from "./Mermaid";

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
}

export function ArticleModal({ article, onClose }: ArticleModalProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(article.markdown)
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      });
  }, [article.markdown]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Hero image */}
        {article.image && (
          <div className="relative h-56 w-full overflow-hidden shrink-0">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              style={article.objectPosition ? { objectPosition: article.objectPosition } : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}

        <ScrollArea className="flex-1 px-8 pb-8">
          {/* Title area */}
          <div className={article.image ? "-mt-12 relative z-10" : "pt-8"}>
            <DialogTitle className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {article.title}
            </DialogTitle>
            <div className="flex flex-wrap gap-2 mt-4 mb-8">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Markdown content */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          ) : (
            <article className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-display prose-headings:font-bold
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-card prose-pre:border prose-pre:border-border
              prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
              prose-img:rounded-lg
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  pre({ children, ...props }) {
                    const child = Array.isArray(children) ? children[0] : children;
                    if (
                      child &&
                      typeof child === "object" &&
                      "props" in child
                    ) {
                      const childProps = child.props as Record<string, unknown>;
                      if (
                        typeof childProps.className === "string" &&
                        childProps.className.includes("language-mermaid")
                      ) {
                        return <Mermaid chart={String(childProps.children).trim()} />;
                      }
                    }
                    return <pre {...props}>{children}</pre>;
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
