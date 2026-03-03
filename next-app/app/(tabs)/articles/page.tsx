import { getArticles, getConfig } from "@/lib/data";
import { ArticlesFilter } from "@/components/ArticlesFilter";

export const revalidate = 86400;

export default async function ArticlesPage() {
  const [articles, config] = await Promise.all([getArticles(), getConfig()]);
  const tags = Object.keys(config.tags);

  return (
    <div className="py-8 md:py-12">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
        Articles
      </h1>
      <ArticlesFilter articles={articles} tags={tags} />
    </div>
  );
}
