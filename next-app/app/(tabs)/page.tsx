import { Suspense } from "react";
import { getConfig } from "@/lib/config";
import { getArticles, getArticleList } from "@/lib/articles";
import { getGitHubData } from "@/lib/github";
import { buildActivityFeed } from "@/lib/activity";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ArticleCard } from "@/components/ArticleCard";
import { Hero } from "@/components/Hero";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Reveal } from "@/components/Reveal";
import { SectionHead } from "@/components/SectionHead";
import {
  ArticleGridSkeleton,
  ProjectGridSkeleton,
  ActivitySkeleton,
} from "@/components/ContentSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/" },
};

async function LatestArticles() {
  const items = await getArticleList(2);
  return (
    <div className="grid grid-cols-1 gap-5.5 wide:grid-cols-2">
      {items.map(({ article, slug, readMinutes }, i) => (
        <Reveal key={slug} delay={i * 55} className="h-full [&>a]:h-full">
          <ArticleCard article={article} slug={slug} readMinutes={readMinutes} />
        </Reveal>
      ))}
    </div>
  );
}

async function SelectedProjects() {
  const { repos, commits } = await getGitHubData(getConfig().social.github.username);
  const selectedRepos = repos.slice(0, 4);
  return (
    <ProjectGrid
      repos={selectedRepos}
      commits={Object.fromEntries(
        selectedRepos.map((repo) => [repo.name, commits[repo.name]])
      )}
    />
  );
}

async function RecentActivity() {
  const config = getConfig();
  const { commits } = await getGitHubData(config.social.github.username);
  return (
    <ActivityFeed
      items={buildActivityFeed(getArticles(), config.featured ?? [], commits)}
      githubUrl={config.social.github.url}
    />
  );
}

export default function HomePage() {
  const config = getConfig();

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
        <Suspense fallback={<ArticleGridSkeleton count={2} />}>
          <LatestArticles />
        </Suspense>
      </section>

      <hr className="-mx-(--pad) h-px border-0 bg-border" />

      {/* Selected projects */}
      <section className="py-[clamp(54px,8vw,92px)]">
        <SectionHead
          kicker="Selected work"
          title="Things I've built"
          link={{ href: "/projects", label: "All projects" }}
        />
        <Suspense fallback={<ProjectGridSkeleton count={4} />}>
          <SelectedProjects />
        </Suspense>
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
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </section>
    </>
  );
}
