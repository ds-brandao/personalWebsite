import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Cloudflare's managed robots.txt (Content Signals) is prepended to this at
// the edge; the Sitemap directive below is what search engines need from us.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
