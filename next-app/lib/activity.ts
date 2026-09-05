import type { ActivityItem, Article, FeaturedItem, GitHubCommit } from "@/types";
import { slugify } from "@/lib/articles";

export function buildActivityFeed(
  articles: Article[],
  featured: FeaturedItem[],
  commits: Record<string, GitHubCommit[]>
): ActivityItem[] {
  const byDate = (a: ActivityItem, b: ActivityItem) =>
    new Date(b.date).getTime() - new Date(a.date).getTime();

  const commitItems: ActivityItem[] = Object.entries(commits).flatMap(
    ([repo, items]) => items.map((commit) => ({
      type: "commit" as const,
      sha: commit.sha,
      message: commit.message,
      repo,
      date: commit.date,
    }))
  );

  // Keep the existing balance: at most five commits in eight recent items.
  return [
    ...commitItems.sort(byDate).slice(0, 5),
    ...articles.map((article): ActivityItem => ({
      type: "article",
      title: article.title,
      slug: slugify(article.title),
      date: article.date,
    })),
    ...featured.map((item): ActivityItem => ({ type: "featured", ...item })),
  ].sort(byDate).slice(0, 8);
}
