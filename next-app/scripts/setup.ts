import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string, defaultValue?: string): Promise<string> {
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  return new Promise((resolve) => {
    rl.question(`${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue || "");
    });
  });
}

async function main() {
  console.log("\n  Portfolio Template Setup\n");
  console.log("  This will configure your personal portfolio site.");
  console.log("  Press Enter to accept defaults shown in parentheses.\n");

  const configPath = path.join(process.cwd(), "public", "config", "config.json");
  let existing: Record<string, unknown> = {};
  try {
    existing = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch {
    // First run — no config yet
  }

  const site = (existing.site ?? {}) as Record<string, string>;
  const personal = (existing.personal ?? {}) as Record<string, unknown>;
  const social = (existing.social ?? {}) as Record<string, unknown>;
  const github = (social.github ?? {}) as Record<string, unknown>;
  const college = (personal.college ?? {}) as Record<string, string>;
  const restaurant = (personal.favoriteRestaurant ?? {}) as Record<string, string>;

  // --- Prompts ---
  const name = await ask("Your name", (personal.name as string) || undefined);
  const title = await ask("Your title/tagline", (personal.title as string) || undefined);
  const siteTitle = await ask("Site title (browser tab)", site.title || name);
  const siteDescription = await ask(
    "Site description (SEO meta)",
    site.description || undefined
  );
  const githubUsername = await ask(
    "GitHub username",
    (github.username as string) || undefined
  );
  const email = await ask("Email address", (social.email as string) || undefined);
  const linkedin = await ask("LinkedIn URL", (social.linkedin as string) || undefined);
  const collegeName = await ask("College/University name", college.name || undefined);
  const collegeUrl = await ask("College/University URL", college.url || undefined);
  const restaurantName = await ask(
    "Favorite restaurant name",
    restaurant.name || undefined
  );
  const restaurantUrl = await ask(
    "Favorite restaurant URL",
    restaurant.url || undefined
  );
  const hiddenReposInput = await ask(
    "Repos to hide (comma-separated, or leave empty)",
    ""
  );
  const hiddenRepos = hiddenReposInput
    ? hiddenReposInput
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean)
    : (github.hiddenRepos as string[]) ?? [];

  // Build config
  const config = {
    site: {
      title: siteTitle,
      description: siteDescription,
    },
    personal: {
      name,
      title,
      college: { name: collegeName, url: collegeUrl },
      favoriteRestaurant: { name: restaurantName, url: restaurantUrl },
    },
    social: {
      github: {
        username: githubUsername,
        url: `https://github.com/${githubUsername}`,
        hiddenRepos,
      },
      email,
      linkedin,
    },
    tags: (existing.tags as Record<string, unknown>) ?? {
      General: {
        color: "general",
        description: "General topics and discussions",
      },
      Tutorial: {
        color: "tutorial",
        description: "Step-by-step guides and tutorials",
      },
    },
    featured: (existing.featured as unknown[]) ?? [],
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");

  console.log(`\n  Config written to ${configPath}`);
  console.log("  Run 'npm run dev' to see your site!\n");

  rl.close();
}

main().catch((err) => {
  console.error("Setup failed:", err);
  rl.close();
  process.exit(1);
});
