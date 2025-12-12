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
      className="glass-card p-6 h-full flex flex-col"
    >
      <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-3">
        <span className="p-2 rounded-lg bg-accent/10 text-accent">
          <FiGitBranch className="w-5 h-5" />
        </span>
        Projects
      </h2>

      <div className="h-[2px] w-10 bg-gradient-to-r from-accent to-accent-light rounded-full mb-4" />

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <FiLoader className="w-6 h-6 text-accent animate-spin" />
            <span className="ml-2 text-text-secondary">Loading projects...</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
            <p className="text-rose-400 mb-2">Unable to load projects</p>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-accent hover:text-accent-light transition-colors"
              >
                <FiGithub /> View on GitHub
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="block bg-surface-2/50 border border-white/5 rounded-xl p-4 group glass-card-hover"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                {repo.name}
              </h3>
              {repo.stargazers_count > 0 && (
                <span className="flex items-center gap-1 text-xs text-text-secondary">
                  <FiStar className="w-3 h-3" />
                  {repo.stargazers_count}
                </span>
              )}
            </div>

            <p className="text-text-secondary text-sm mb-3 line-clamp-2">
              {repo.description || 'No description available'}
            </p>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-xs text-text-secondary bg-accent/10 px-3 py-1.5 rounded-lg group-hover:bg-accent/20 transition-colors">
                <FiGithub className="w-3 h-3" />
                Repository
              </span>
              {repo.homepage && (
                <span className="inline-flex items-center gap-2 text-xs text-text-secondary bg-accent/10 px-3 py-1.5 rounded-lg group-hover:bg-accent/20 transition-colors">
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
