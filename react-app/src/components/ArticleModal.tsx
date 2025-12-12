import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Article } from '../types';

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (article?.markdown && isOpen) {
      setLoading(true);
      fetch(article.markdown)
        .then(res => res.text())
        .then(text => {
          setContent(text);
          setLoading(false);
        })
        .catch(() => {
          setContent('Failed to load article content.');
          setLoading(false);
        });
    }
  }, [article, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && article && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-sm overflow-y-auto py-8 px-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="relative w-full max-w-4xl bg-surface-1 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="fixed top-4 right-4 md:top-6 md:right-6 z-50 p-3 bg-surface-2/90 backdrop-blur-md border border-white/10 rounded-full text-text-primary hover:bg-accent/20 hover:border-accent/40 transition-all shadow-lg"
              aria-label="Close modal"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Hero Image */}
            {article.image && (
              <div className="relative h-48 md:h-64 lg:h-80 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: article.objectPosition || 'center 35%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-transparent to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-10 lg:p-12">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <article className="markdown-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom rendering for code blocks
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isMermaid = match && match[1] === 'mermaid';

                        if (isMermaid) {
                          return (
                            <div className="mermaid">
                              {String(children).replace(/\n$/, '')}
                            </div>
                          );
                        }

                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      // Custom link rendering
                      a({ href, children }) {
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent-light transition-colors"
                          >
                            {children}
                          </a>
                        );
                      },
                      // Custom image rendering
                      img({ src, alt }) {
                        return (
                          <img
                            src={src}
                            alt={alt || ''}
                            loading="lazy"
                            className="rounded-xl my-6 max-w-full shadow-lg"
                          />
                        );
                      },
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </article>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
