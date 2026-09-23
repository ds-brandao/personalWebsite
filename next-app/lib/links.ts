import { SITE_URL } from "@/lib/site";

// Tracked short links: dbrandao.com/r/<slug> redirects to the destination and
// emails a click alert (see app/r/[slug]/route.ts). Slugs are printed on the
// resume, so renaming one breaks links already sent out.
export const LINKS: Record<string, string> = {
  netwiz: "https://github.com/ds-brandao/netwiz",
  homelab: SITE_URL,
  "network-security": SITE_URL,
  "intrusion-detection": SITE_URL,
};
