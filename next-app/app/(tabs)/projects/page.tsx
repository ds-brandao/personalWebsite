import { getConfig, getGitHubRepos, getRepoCommits } from "@/lib/data";
import { ProjectGrid } from "@/components/ProjectGrid";
import { SectionHead } from "@/components/SectionHead";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const config = await getConfig();
  const repos = await getGitHubRepos(config.social.github.username);
  const commits = await getRepoCommits(config.social.github.username, repos);

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
      <ProjectGrid repos={repos} commits={commits} />
    </div>
  );
}
