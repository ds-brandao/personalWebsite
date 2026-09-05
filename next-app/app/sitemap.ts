import type { MetadataRoute } from "next";
import { getArticles, slugify } from "@/lib/articles";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getArticles();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...articles.map((article) => ({
      url: `${SITE_URL}/articles/${slugify(article.title)}`,
      lastModified: new Date(article.date),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
