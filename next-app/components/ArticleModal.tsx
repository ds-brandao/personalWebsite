"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Article } from "@/types";
import { X } from "lucide-react";

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

export function ArticleModal({ article, onClose }: ArticleModalProps) {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!article) return;
    setLoading(true);
    fetch(article.markdown)
      .then((res) => res.text())
      .then((text) => {
        setMarkdown(text);
        setLoading(false);
      })
      .catch(() => {
        setMarkdown("Failed to load article content.");
        setLoading(false);
      });
  }, [article]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = article ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [article, handleKeyDown]);

  return (
    <AnimatePresence>
      {article && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto my-8"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="fixed top-6 right-6 z-50 p-2 rounded-full bg-surface-2 text-text-secondary hover:text-ember hover:bg-surface-3 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            {/* Hero image */}
            <div className="relative h-[40vh] overflow-hidden rounded-t-xl">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: article.objectPosition || "center",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-3">
                  {article.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="tag-base border-ember/40 text-ember bg-ember/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-surface-1 rounded-b-xl px-6 md:px-12 py-10">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-surface-2 rounded animate-pulse"
                      style={{ width: `${70 + Math.random() * 30}%` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="font-display text-3xl font-bold text-text-primary mt-8 mb-4">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-display text-2xl font-semibold text-text-primary mt-6 mb-3">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-display text-xl font-semibold text-text-primary mt-5 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-text-secondary leading-relaxed mb-4">
                          {children}
                        </p>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ember hover:text-ember-glow underline underline-offset-2 transition-colors"
                        >
                          {children}
                        </a>
                      ),
                      code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        if (isInline) {
                          return (
                            <code className="bg-surface-2 text-ember-glow px-1.5 py-0.5 rounded text-sm font-mono">
                              {children}
                            </code>
                          );
                        }
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="bg-surface-2 rounded-lg p-4 overflow-x-auto text-sm mb-4">
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-ember/50 pl-4 italic text-text-muted my-4">
                          {children}
                        </blockquote>
                      ),
                      img: ({ src, alt }) => (
                        <img
                          src={src}
                          alt={alt || ""}
                          className="rounded-lg my-4 w-full"
                        />
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside text-text-secondary space-y-1 mb-4">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside text-text-secondary space-y-1 mb-4">
                          {children}
                        </ol>
                      ),
                    }}
                  >
                    {markdown}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
