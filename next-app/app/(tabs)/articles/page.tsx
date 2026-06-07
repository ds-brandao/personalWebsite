import { getArticles, getReadMinutes, slugify } from "@/lib/data";
import { ArticlesFilter } from "@/components/ArticlesFilter";
import { SectionHead } from "@/components/SectionHead";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Articles",
  description:
    "Articles by Daniel Brandao on cybersecurity, applied AI, home labs, and systems integration.",
  alternates: { canonical: "/articles" },
};

export default async function ArticlesPage() {
  const articles = await getArticles();

  const items = await Promise.all(
    [...articles]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(async (article) => ({
        article,
        slug: slugify(article.title),
        readMinutes: await getReadMinutes(article.markdown),
      }))
  );

  return (
    <div className="view py-[clamp(40px,6vw,72px)]">
      <SectionHead kicker="Notes from the lab" title="Articles" />
      <ArticlesFilter items={items} />
    </div>
  );
}
