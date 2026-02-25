import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiExternalLink, FiX, FiAward } from 'react-icons/fi';

const FEATURED_ARTICLE = {
  title: 'Project Portfolios and Networking Leads to Jobs',
  source: 'CoE Cyber',
  url: 'https://coecyber.io/project-portfolios-and-networking-leads-to-jobs',
};

export default function FeaturedArticle() {
  const [isIframeOpen, setIsIframeOpen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  const handleOpen = () => {
    setIsIframeOpen(true);
    setIframeLoading(true);
  };

  const handleClose = useCallback(() => {
    setIsIframeOpen(false);
    setIframeLoading(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isIframeOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isIframeOpen, handleClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose]
  );

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="apple-glass-card p-5 relative overflow-hidden"
      >
        {/* Light refraction effect at top */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/10 to-transparent rounded-t-3xl" />
        <div className="absolute inset-x-4 top-[1px] h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative z-10">
          <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-accent/10 text-accent">
              <FiAward className="w-4 h-4" />
            </span>
            Featured In
          </h2>

          <div className="h-[1px] w-6 bg-gradient-to-r from-accent to-accent-light rounded-full mb-3" />

          <button
            onClick={handleOpen}
            className="w-full text-left group cursor-pointer"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-300 group-hover:border-accent/30 group-hover:bg-accent/5 group-hover:shadow-lg group-hover:shadow-accent/5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-accent font-medium mb-1">
                    {FEATURED_ARTICLE.source}
                  </p>
                  <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors leading-snug">
                    {FEATURED_ARTICLE.title}
                  </h3>
                </div>
                <div className="p-2 rounded-lg bg-accent/10 text-accent opacity-0 group-hover:opacity-100 transition-all shrink-0">
                  <FiExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </motion.section>

      {/* Iframe Modal */}
      {createPortal(
        <AnimatePresence>
          {isIframeOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8"
              onClick={handleBackdropClick}
            >
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                className="relative w-full max-w-[95vw] xl:max-w-[1400px] h-[90vh] bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/5 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1a1a1a] shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
                      <FiAward className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-accent font-medium">
                        {FEATURED_ARTICLE.source}
                      </p>
                      <h3 className="text-sm font-medium text-text-primary truncate">
                        {FEATURED_ARTICLE.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={FEATURED_ARTICLE.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-[#252525]/80 backdrop-blur-md border border-white/15 rounded-full text-text-secondary hover:text-accent hover:border-accent/40 transition-all"
                      title="Open in new tab"
                    >
                      <FiExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={handleClose}
                      className="p-2.5 bg-[#252525]/80 backdrop-blur-md border border-white/15 rounded-full text-text-primary hover:bg-accent/20 hover:border-accent/40 transition-all group"
                      aria-label="Close modal"
                    >
                      <FiX className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                  </div>
                </div>

                {/* Iframe */}
                <div className="flex-1 relative bg-white">
                  {iframeLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] z-10">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                        <p className="text-text-secondary text-sm">
                          Loading article...
                        </p>
                      </div>
                    </div>
                  )}
                  <iframe
                    src={FEATURED_ARTICLE.url}
                    title={FEATURED_ARTICLE.title}
                    className="w-full h-full border-0"
                    onLoad={() => setIframeLoading(false)}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
