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
import { ArticleCarousel } from "@/components/ArticleCarousel";
import { FeaturedSection } from "@/components/FeaturedSection";

export const revalidate = 86400;

export default async function HomePage() {
  const config = await getConfig();
  const [articles, repos] = await Promise.all([
    getArticles(),
    getGitHubRepos(config.social.github.username),
  ]);
  const commits = await getRepoCommits(config.social.github.username, repos);

  // Build feed items by type
  const commitItems: ActivityItem[] = [];
  for (const [repo, repoCommits] of Object.entries(commits)) {
    for (const c of repoCommits) {
      commitItems.push({
        type: "commit",
        sha: c.sha,
        message: c.message,
        repo,
        author: c.authorName,
        date: c.date,
      });
    }
  }

  const contentItems: ActivityItem[] = [];
  for (const article of articles) {
    contentItems.push({
      type: "article",
      title: article.title,
      summary: article.summary,
      slug: slugify(article.title),
      tags: article.tags,
      date: article.date,
    });
  }
  if (config.featured) {
    for (const item of config.featured) {
      contentItems.push({
        type: "featured",
        title: item.title,
        source: item.source,
        url: item.url,
        date: item.date,
      });
    }
  }

  // Sort each group by date (newest first)
  const byDate = (a: ActivityItem, b: ActivityItem) =>
    new Date(b.date).getTime() - new Date(a.date).getTime();
  commitItems.sort(byDate);
  contentItems.sort(byDate);

  // Take the latest commits (capped so they don't flood the feed)
  // then merge with all content items and sort chronologically
  const feedItems = [...commitItems.slice(0, 5), ...contentItems];
  feedItems.sort(byDate);

  const capped = feedItems.slice(0, 10);

  // Articles sorted by date for the carousel
  const sortedArticles = [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((a) => ({ article: a, slug: slugify(a.title) }));

  return (
    <div className="py-8 md:py-12">
      {/* Name (mobile only) + Social icons */}
      <section className="mb-10 flex flex-col items-center">
        <h1 className="md:hidden font-display text-3xl font-bold text-foreground mb-2">
          {config.personal.name}
        </h1>
        <SocialIcons
          github={config.social.github.url}
          linkedin={config.social.linkedin}
          email={config.social.email}
        />
      </section>

      {/* Articles carousel */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          Articles
        </h2>
        <ArticleCarousel articles={sortedArticles} />
      </section>

      {/* Featured / Press */}
      {config.featured && config.featured.length > 0 && (
        <FeaturedSection items={config.featured} />
      )}

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
