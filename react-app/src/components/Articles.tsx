import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiEdit3, FiChevronRight } from 'react-icons/fi';
import type { Article, Config } from '../types';

interface ArticlesProps {
  articles: Article[];
  config: Config | null;
  onArticleClick: (article: Article) => void;
}

function getTagClass(tag: string): string {
  const normalizedTag = tag.toLowerCase().replace(/[\/\s]/g, '-');
  const tagClasses: Record<string, string> = {
    'security': 'tag-security',
    'coding': 'tag-coding',
    'ai': 'tag-ai',
    'tutorial': 'tag-tutorial',
    'project': 'tag-project',
    'intro': 'tag-intro',
    'ci-cd': 'tag-ci\\/cd',
    'home-lab': 'tag-home-lab',
    'systems-integration': 'tag-systems-integration',
    'life': 'tag-life',
    'celery': 'tag-celery',
  };
  return tagClasses[normalizedTag] || 'tag-intro';
}

export default function Articles({ articles, config, onArticleClick }: ArticlesProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);

  const availableTags = useMemo(() => {
    if (!config?.tags) return [];
    return Object.keys(config.tags);
  }, [config]);

  const filteredArticles = useMemo(() => {
    if (activeFilters.includes('all')) return articles;
    return articles.filter(article =>
      article.tags?.some(tag =>
        activeFilters.some(filter => tag.toLowerCase() === filter.toLowerCase())
      )
    );
  }, [articles, activeFilters]);

  const toggleFilter = (filter: string) => {
    if (filter === 'all') {
      setActiveFilters(['all']);
    } else {
      setActiveFilters(prev => {
        const newFilters = prev.filter(f => f !== 'all');
        if (newFilters.includes(filter)) {
          const result = newFilters.filter(f => f !== filter);
          return result.length === 0 ? ['all'] : result;
        } else {
          return [...newFilters, filter];
        }
      });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="apple-glass-card p-6 h-full flex flex-col"
    >
      <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-3">
        <span className="p-2 rounded-lg bg-accent/10 text-accent">
          <FiEdit3 className="w-5 h-5" />
        </span>
        Articles
      </h2>

      <div className="h-[2px] w-10 bg-gradient-to-r from-accent to-accent-light rounded-full mb-4" />

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => toggleFilter('all')}
          className={`tag-base ${
            activeFilters.includes('all')
              ? 'bg-accent/20 text-accent border-accent/40'
              : 'bg-surface-2/50 text-text-secondary border-white/10 hover:bg-surface-2'
          }`}
        >
          All
        </button>
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleFilter(tag)}
            className={`tag-base ${
              activeFilters.includes(tag)
                ? 'bg-accent/20 text-accent border-accent/40'
                : 'bg-surface-2/50 text-text-secondary border-white/10 hover:bg-surface-2'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredArticles.map((article, index) => {
              const isFeatured = index === 0;
              return (
                <motion.article
                  key={article.title}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => onArticleClick(article)}
                  className={`bg-surface-2/50 border border-white/5 rounded-xl overflow-hidden cursor-pointer group glass-card-hover ${
                    isFeatured ? 'lg:col-span-2' : ''
                  }`}
                >
                  {article.image && (
                    <div className={`relative overflow-hidden ${isFeatured ? 'h-56' : 'h-44'}`}>
                      <img
                        src={article.image}
                        alt={article.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ objectPosition: article.objectPosition || 'center' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-2 via-surface-2/20 to-transparent opacity-80" />
                      {/* Featured badge */}
                      {isFeatured && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-accent/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                          Latest
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`${isFeatured ? 'p-6' : 'p-4'}`}>
                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {article.tags.map(tag => (
                          <span key={tag} className={`tag-base ${getTagClass(tag)}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <h3 className={`font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors ${
                      isFeatured ? 'text-xl' : 'text-base'
                    }`}>
                      {article.title}
                    </h3>

                    <p className={`text-text-secondary line-clamp-2 mb-4 ${isFeatured ? 'text-base' : 'text-sm'}`}>
                      {article.summary}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary/70 group-hover:text-text-secondary transition-colors">
                        Click to read
                      </span>
                      <FiChevronRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.article>
              );
            })}
        </div>
      </div>
    </motion.section>
  );
}
