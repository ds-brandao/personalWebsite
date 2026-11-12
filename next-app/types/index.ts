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
  apps?: App[];
}

export interface FeaturedItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  objectPosition?: string;
  date: string;
}

export interface App {
  name: string;
  platform: string;
  summary: string;
  url: string;
  icon: string;
  screenshots: { src: string; alt: string }[];
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

export type ArticleListItem =
  | {
      kind: "article";
      article: Article;
      slug: string;
      readMinutes: number | null;
    }
  | { kind: "featured"; item: FeaturedItem };

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

