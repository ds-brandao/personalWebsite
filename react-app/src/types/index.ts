export interface Config {
  personal: {
    name: string;
    title: string;
    college: {
      name: string;
      url: string;
    };
    favoriteRestaurant: {
      name: string;
      url: string;
    };
  };
  social: {
    github: {
      username: string;
      url: string;
    };
    email: string;
    linkedin: string;
  };
  tags: Record<string, {
    color: string;
    description: string;
  }>;
}

export interface Article {
  title: string;
  summary: string;
  markdown: string;
  image: string;
  thumbnail?: string;
  objectPosition?: string;
  tags: string[];
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
