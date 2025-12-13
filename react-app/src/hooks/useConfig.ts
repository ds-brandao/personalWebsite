import { useState, useEffect } from 'react';
import type { Config, Article, GitHubRepo } from '../types';

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/config/config.json');
        if (!response.ok) throw new Error('Failed to load config');
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  return { config, loading, error };
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch(`/config/articles.json?_=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to load articles');
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  return { articles, loading, error };
}

export function useGitHubRepos(username: string | undefined) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    async function fetchRepos() {
      try {
        // Try proxy first, then direct API
        let response = await fetch(
          `/github-api/users/${username}/repos?sort=updated&per_page=10&direction=desc`,
          { cache: 'no-cache' }
        );

        if (!response.ok) {
          // Fallback to direct GitHub API
          response = await fetch(
            `https://api.github.com/users/${username}/repos?sort=updated&per_page=10&direction=desc`,
            {
              headers: { 'Accept': 'application/vnd.github.v3+json' },
              cache: 'no-cache',
            }
          );
        }

        if (!response.ok) throw new Error('Failed to fetch repos');
        const data = await response.json();
        setRepos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Try loading from local fallback
        try {
          const fallbackResponse = await fetch('/config/projects.json');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setRepos(fallbackData);
            setError(null);
          }
        } catch {
          // Keep original error
        }
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, [username]);

  return { repos, loading, error };
}
