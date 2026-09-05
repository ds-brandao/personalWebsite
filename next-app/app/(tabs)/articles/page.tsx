import { getArticleList } from "@/lib/articles";
import { ArticlesFilter } from "@/components/ArticlesFilter";
import { SectionHead } from "@/components/SectionHead";

export const metadata = {
  title: "Articles",
  description:
    "Articles by Daniel Brandao on cybersecurity, applied AI, home labs, and systems integration.",
  alternates: { canonical: "/articles" },
};

export default async function ArticlesPage() {
  const items = await getArticleList();

  return (
    <div className="view py-[clamp(40px,6vw,72px)]">
      <SectionHead kicker="Notes from the lab" title="Articles" />
      <ArticlesFilter items={items} />
    </div>
  );
}
