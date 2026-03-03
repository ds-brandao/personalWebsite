import { getConfig, getGitHubRepos, getRepoCommits } from "@/lib/data";
import { HomeFeed } from "@/components/HomeFeed";

export const revalidate = 86400;

export default async function HomePage() {
  const config = await getConfig();
  const repos = await getGitHubRepos(config.social.github.username);
  const commits = await getRepoCommits(config.social.github.username, repos);

  return (
    <div className="py-8 md:py-12">
      {/* Hero */}
      <section className="mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          {config.personal.name}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">{config.personal.title}</p>
      </section>

      {/* Activity feed */}
      <section>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          Recent Activity
        </h2>
        <HomeFeed commits={commits} />
      </section>
    </div>
  );
}
