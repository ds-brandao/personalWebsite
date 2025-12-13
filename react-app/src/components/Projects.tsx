import { motion } from 'framer-motion';
import { FiGitBranch, FiGithub, FiExternalLink, FiStar, FiLoader } from 'react-icons/fi';
import type { GitHubRepo } from '../types';

interface ProjectsProps {
  repos: GitHubRepo[];
  loading: boolean;
  error: string | null;
  githubUrl?: string;
}

export default function Projects({ repos, loading, error, githubUrl }: ProjectsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="apple-glass-card p-4 h-full flex flex-col"
    >
      <h2 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
        <span className="p-1 rounded-md bg-accent/10 text-accent">
          <FiGitBranch className="w-3.5 h-3.5" />
        </span>
        Projects
      </h2>

      <div className="h-[1px] w-6 bg-gradient-to-r from-accent to-accent-light rounded-full mb-2" />

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-6">
            <FiLoader className="w-5 h-5 text-accent animate-spin" />
            <span className="ml-2 text-text-secondary text-sm">Loading...</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-center">
            <p className="text-rose-400 text-sm mb-1">Unable to load</p>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-light transition-colors"
              >
                <FiGithub className="w-3 h-3" /> View on GitHub
              </a>
            )}
          </div>
        )}

        {!loading && !error && repos.map((repo, index) => (
          <motion.a
            key={repo.id || repo.name}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="block bg-surface-2/50 border border-white/5 rounded-lg p-3 group glass-card-hover"
          >
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-sm text-text-primary group-hover:text-accent transition-colors">
                {repo.name}
              </h3>
              {repo.stargazers_count > 0 && (
                <span className="flex items-center gap-1 text-xs text-text-secondary">
                  <FiStar className="w-3 h-3" />
                  {repo.stargazers_count}
                </span>
              )}
            </div>

            <p className="text-text-secondary text-xs mb-2 line-clamp-2">
              {repo.description || 'No description available'}
            </p>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-text-secondary bg-accent/10 px-2 py-1 rounded group-hover:bg-accent/20 transition-colors">
                <FiGithub className="w-3 h-3" />
                Repository
              </span>
              {repo.homepage && (
                <span className="inline-flex items-center gap-1 text-xs text-text-secondary bg-accent/10 px-2 py-1 rounded group-hover:bg-accent/20 transition-colors">
                  <FiExternalLink className="w-3 h-3" />
                  Demo
                </span>
              )}
            </div>
          </motion.a>
        ))}
      </div>
    </motion.section>
  );
}
