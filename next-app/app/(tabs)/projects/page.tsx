import { Suspense } from "react";
import { getConfig } from "@/lib/config";
import { getGitHubData } from "@/lib/github";
import { ProjectGrid } from "@/components/ProjectGrid";
import { ProjectGridSkeleton } from "@/components/ContentSkeletons";
import { SectionHead } from "@/components/SectionHead";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Projects",
  description:
    "Projects by Daniel Brandao — security tooling, applied AI agents, and automation.",
  alternates: { canonical: "/projects" },
};

async function Projects() {
  const { repos, commits } = await getGitHubData(getConfig().social.github.username);
  return <ProjectGrid repos={repos} commits={commits} />;
}

export default function ProjectsPage() {
  const config = getConfig();

  return (
    <div className="view py-[clamp(40px,6vw,72px)]">
      <SectionHead
        kicker="Everything I'm building"
        title="Projects"
        link={{
          href: config.social.github.url,
          label: "Browse on GitHub",
          external: true,
        }}
      />
      <Suspense fallback={<ProjectGridSkeleton />}>
        <Projects />
      </Suspense>
    </div>
  );
}
