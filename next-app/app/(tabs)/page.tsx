import {
  getConfig,
  getArticles,
  getGitHubRepos,
  getRepoCommits,
  getReadMinutes,
  slugify,
} from "@/lib/data";
import { ActivityFeed } from "@/components/ActivityFeed";
import type { ActivityItem } from "@/components/ActivityFeed";
import { ArticleCard } from "@/components/ArticleCard";
import { Hero } from "@/components/Hero";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Reveal } from "@/components/Reveal";
import { SectionHead } from "@/components/SectionHead";

export const dynamic = "force-dynamic";

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
        date: c.date,
      });
    }
  }

  const contentItems: ActivityItem[] = [];
  for (const article of articles) {
    contentItems.push({
      type: "article",
      title: article.title,
      slug: slugify(article.title),
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

  const capped = feedItems.slice(0, 8);

  // Latest two articles for the home preview
  const latestArticles = await Promise.all(
    [...articles]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 2)
      .map(async (article) => ({
        article,
        slug: slugify(article.title),
        readMinutes: await getReadMinutes(article.markdown),
      }))
  );

  return (
    <>
      <Hero config={config} />

      {/* Latest articles */}
      <section className="pb-[clamp(54px,8vw,92px)]">
        <SectionHead
          kicker="Latest articles"
          title="From the blog"
          link={{ href: "/articles", label: "All articles" }}
        />
        <div className="grid grid-cols-1 gap-5.5 wide:grid-cols-2">
          {latestArticles.map(({ article, slug, readMinutes }, i) => (
            <Reveal key={slug} delay={i * 55} className="h-full [&>a]:h-full">
              <ArticleCard
                article={article}
                slug={slug}
                readMinutes={readMinutes}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <hr className="-mx-(--pad) h-px border-0 bg-border" />

      {/* Selected projects */}
      <section className="py-[clamp(54px,8vw,92px)]">
        <SectionHead
          kicker="Selected work"
          title="Things I've built"
          link={{ href: "/projects", label: "All projects" }}
        />
        <ProjectGrid repos={repos.slice(0, 4)} commits={commits} />
      </section>

      <hr className="-mx-(--pad) h-px border-0 bg-border" />

      {/* Recent activity */}
      <section className="py-[clamp(34px,5vw,54px)]">
        <SectionHead
          kicker="Recent activity"
          link={{
            href: config.social.github.url,
            label: "On GitHub",
            external: true,
          }}
        />
        <ActivityFeed items={capped} githubUrl={config.social.github.url} />
      </section>
    </>
  );
}
