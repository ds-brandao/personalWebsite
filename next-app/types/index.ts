export interface Config {
  personal: {
    name: string;
    location: string;
    lead: string;
  };
  social: {
    github: { username: string; url: string };
    email: string;
    linkedin: string;
  };
  tags: Record<string, { color: string; description: string }>;
  featured?: FeaturedItem[];
}

export interface FeaturedItem {
  title: string;
  source: string;
  url: string;
  date: string;
}

export interface Article {
  title: string;
  summary: string;
  markdown: string;
  image: string;
  objectPosition?: string;
  tags: string[];
  date: string;
}

export interface ArticleListItem {
  article: Article;
  slug: string;
  readMinutes: number | null;
}

export type ActivityItem =
  | { type: "commit"; sha: string; message: string; repo: string; date: string }
  | { type: "article"; title: string; slug: string; date: string }
  | { type: "featured"; title: string; source: string; url: string; date: string };

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  pushed_at?: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  authorName: string;
  date: string;
}
