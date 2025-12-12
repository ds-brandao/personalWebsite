import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Hero,
  About,
  Articles,
  Projects,
  Contact,
  Footer,
  ArticleModal,
} from './components';
import { useConfig, useArticles, useGitHubRepos } from './hooks/useConfig';
import type { Article } from './types';

function App() {
  const { config, loading: configLoading } = useConfig();
  const { articles } = useArticles();
  const { repos, loading: reposLoading, error: reposError } = useGitHubRepos(
    config?.social.github.username
  );

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedArticle(null), 300);
  };

  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-light/10 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6 min-h-[calc(100vh-4rem)]">
            {/* Left Column - Articles */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="row-span-2"
            >
              <div className="sticky top-8 h-[calc(100vh-4rem)]">
                <Articles
                  articles={articles}
                  config={config}
                  onArticleClick={handleArticleClick}
                />
              </div>
            </motion.div>

            {/* Center Column */}
            <div className="space-y-6">
              <Hero />
              <About config={config} />
              <Contact config={config} />
            </div>

            {/* Right Column - Projects */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="row-span-2"
            >
              <div className="sticky top-8 h-[calc(100vh-4rem)]">
                <Projects
                  repos={repos}
                  loading={reposLoading}
                  error={reposError}
                  githubUrl={config?.social.github.url}
                />
              </div>
            </motion.div>
          </div>

          {/* Tablet Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:hidden gap-6">
            <div className="col-span-2">
              <Hero />
            </div>
            <About config={config} />
            <Contact config={config} />
            <div className="h-[500px]">
              <Articles
                articles={articles}
                config={config}
                onArticleClick={handleArticleClick}
              />
            </div>
            <div className="h-[500px]">
              <Projects
                repos={repos}
                loading={reposLoading}
                error={reposError}
                githubUrl={config?.social.github.url}
              />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-6">
            <Hero />
            <About config={config} />
            <div className="h-[500px]">
              <Articles
                articles={articles}
                config={config}
                onArticleClick={handleArticleClick}
              />
            </div>
            <div className="h-[500px]">
              <Projects
                repos={repos}
                loading={reposLoading}
                error={reposError}
                githubUrl={config?.social.github.url}
              />
            </div>
            <Contact config={config} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer config={config} />

      {/* Article Modal */}
      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default App;
