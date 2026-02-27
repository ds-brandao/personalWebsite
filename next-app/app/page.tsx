import {
  getConfig,
  getArticles,
  getGitHubRepos,
  getProjectAnalyses,
  getRepoCommits,
} from "@/lib/data";
import { PageClient } from "@/components/PageClient";

export const revalidate = 86400; // 24 hours

export default async function Home() {
  const config = await getConfig();
  const articles = await getArticles();
  const repos = await getGitHubRepos(config.social.github.username);
  const [analyses, commits] = await Promise.all([
    getProjectAnalyses(),
    getRepoCommits(config.social.github.username, repos),
  ]);

  return (
    <PageClient
      config={config}
      articles={articles}
      repos={repos}
      analyses={analyses}
      commits={commits}
    />
  );
}
