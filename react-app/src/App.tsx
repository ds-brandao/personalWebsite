import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Hero,
  Articles,
  Projects,
  Footer,
  ArticleModal,
  ParticleBackground,
  LoadingScreen,
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
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  // Track when data is ready
  useEffect(() => {
    if (!configLoading) {
      setDataReady(true);
    }
  }, [configLoading]);

  const handleLoadingComplete = useCallback(() => {
    // Only hide loading screen if data is ready
    if (dataReady) {
      setShowLoadingScreen(false);
    }
  }, [dataReady]);

  // If data becomes ready after loading animation, hide loading screen
  useEffect(() => {
    if (dataReady && !showLoadingScreen) {
      return;
    }
  }, [dataReady, showLoadingScreen]);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedArticle(null), 300);
  };

  // Show loading screen
  if (showLoadingScreen) {
    return <LoadingScreen onComplete={handleLoadingComplete} minDisplayTime={2500} />;
  }

  return (
    <motion.div
      className="min-h-screen bg-bg relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
    >
      {/* Starfield Particle Background */}
      <ParticleBackground />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
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
          {/* Desktop Layout - Articles take 2/3, Sidebar takes 1/3 */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6 min-h-[calc(100vh-4rem)]">
            {/* Main Content - Articles (2/3 width) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="col-span-2"
            >
              <div className="sticky top-8 h-[calc(100vh-4rem)]">
                <Articles
                  articles={articles}
                  config={config}
                  onArticleClick={handleArticleClick}
                />
              </div>
            </motion.div>

            {/* Sidebar (1/3 width) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col gap-4 h-[calc(100vh-4rem)] sticky top-8"
            >
              <Hero config={config} />
              <div className="flex-1 min-h-0">
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
              <Hero config={config} />
            </div>
            {/* Articles full width with increased height */}
            <div className="col-span-2 h-[650px]">
              <Articles
                articles={articles}
                config={config}
                onArticleClick={handleArticleClick}
              />
            </div>
            <div className="col-span-2 h-[400px]">
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
            <Hero config={config} />
            {/* Articles with increased height for mobile */}
            <div className="h-[650px]">
              <Articles
                articles={articles}
                config={config}
                onArticleClick={handleArticleClick}
              />
            </div>
            <div className="h-[400px]">
              <Projects
                repos={repos}
                loading={reposLoading}
                error={reposError}
                githubUrl={config?.social.github.url}
              />
            </div>
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
    </motion.div>
  );
}

export default App;
