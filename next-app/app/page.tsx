import { getConfig, getArticles, getGitHubRepos } from "@/lib/data";
import { PageClient } from "@/components/PageClient";

export default async function Home() {
  const config = await getConfig();
  const articles = await getArticles();
  const repos = await getGitHubRepos(config.social.github.username);

  return <PageClient config={config} articles={articles} repos={repos} />;
}
