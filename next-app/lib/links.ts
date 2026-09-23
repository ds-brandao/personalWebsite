import { SITE_URL } from "@/lib/site";

// Tracked short links: dbrandao.com/r/<slug> redirects to the destination and
// emails a click alert (see app/r/[slug]/route.ts). Slugs are printed on the
// resume, so renaming one breaks links already sent out.
export const LINKS: Record<string, string> = {
  // Contact line
  email: "mailto:danibrandao@icloud.com",
  linkedin: "https://www.linkedin.com/in/dsbrandao/",
  github: "https://github.com/ds-brandao",
  website: SITE_URL,
  // Projects (article paths are /articles/<slugify(title)>, see lib/data.ts)
  netwiz: "https://github.com/ds-brandao/netwiz",
  homelab: `${SITE_URL}/articles/leveraging-github-self-hosted-runners-for-ci-cd-in-a-home-lab`,
  "network-security": `${SITE_URL}/articles`,
  "intrusion-detection": `${SITE_URL}/articles`,
};
