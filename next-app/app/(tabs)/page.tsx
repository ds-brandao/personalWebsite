import {
  getConfig,
  getArticles,
  getGitHubRepos,
  getRepoCommits,
  slugify,
} from "@/lib/data";
import { ActivityFeed } from "@/components/ActivityFeed";
import type { ActivityItem } from "@/components/ActivityFeed";
import { SocialIcons } from "@/components/SocialIcons";

export const revalidate = 86400;

export default async function HomePage() {
  const config = await getConfig();
  const [articles, repos] = await Promise.all([
    getArticles(),
    getGitHubRepos(config.social.github.username),
  ]);
  const commits = await getRepoCommits(config.social.github.username, repos);

  // Build unified feed
  const feedItems: ActivityItem[] = [];

  // Add commits
  for (const [repo, repoCommits] of Object.entries(commits)) {
    for (const c of repoCommits) {
      feedItems.push({
        type: "commit",
        sha: c.sha,
        message: c.message,
        repo,
        author: c.authorName,
        date: c.date,
      });
    }
  }

  // Add articles (use index as pseudo-chronology — first in array = most recent)
  for (const article of articles) {
    feedItems.push({
      type: "article",
      title: article.title,
      summary: article.summary,
      slug: slugify(article.title),
      tags: article.tags,
    });
  }

  // Add featured
  if (config.featured) {
    for (const item of config.featured) {
      feedItems.push({
        type: "featured",
        title: item.title,
        source: item.source,
        url: item.url,
      });
    }
  }

  // Sort: commits by date (newest first), then articles/featured appended
  // Commits have dates; articles/featured don't — interleave by putting
  // articles and featured between commits
  const withDates = feedItems.filter(
    (i) => i.type === "commit"
  ) as Array<ActivityItem & { type: "commit" }>;
  const withoutDates = feedItems.filter((i) => i.type !== "commit");

  withDates.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Interleave: insert non-dated items at positions 2, 5, etc.
  const merged: ActivityItem[] = [...withDates];
  let insertIdx = 2;
  for (const item of withoutDates) {
    merged.splice(insertIdx, 0, item);
    insertIdx += 3;
  }

  const capped = merged.slice(0, 8);

  return (
    <div className="py-8 md:py-12">
      {/* Hero */}
      <section className="mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          {config.personal.name}
        </h1>
        <SocialIcons
          github={config.social.github.url}
          linkedin={config.social.linkedin}
          email={config.social.email}
        />
      </section>

      {/* Unified activity feed */}
      <section>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          Recent Activity
        </h2>
        <ActivityFeed items={capped} />
      </section>
    </div>
  );
}
