export interface Config {
  personal: {
    name: string;
    title: string;
    college: { name: string; url: string };
    favoriteRestaurant: { name: string; url: string };
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

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  authorName: string;
  date: string;
}

export interface ToolResult {
  toolName:
    | "displayPackageInfo"
    | "displayCodeSnippet"
    | "displayFileStructure"
    | "displaySetupCommand";
  result: Record<string, unknown>;
}

export interface ProjectAnalysis {
  repoName: string;
  toolResults: ToolResult[];
  cachedAt: string;
}
