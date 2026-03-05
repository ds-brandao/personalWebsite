import {
  getConfig,
  getGitHubRepos,
  getRepoCommits,
  getProjectAnalyses,
} from "@/lib/data";
import { ProjectGrid } from "@/components/ProjectGrid";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const config = await getConfig();
  const repos = await getGitHubRepos(config.social.github.username);
  const [commits, analyses] = await Promise.all([
    getRepoCommits(config.social.github.username, repos),
    getProjectAnalyses(),
  ]);

  return (
    <div className="py-8 md:py-12">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
        Projects
      </h1>
      <ProjectGrid repos={repos} commits={commits} analyses={analyses} />
    </div>
  );
}
