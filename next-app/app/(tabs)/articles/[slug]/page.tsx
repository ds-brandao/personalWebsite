import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug, getArticleContent } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { ArticleReader } from "@/components/ArticleReader";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/articles/${slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      url: `/articles/${slug}`,
      publishedTime: article.date,
      authors: ["Daniel Brandao"],
      images: article.image ? [{ url: article.image }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const content = await getArticleContent(article);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.summary,
    datePublished: article.date,
    image: article.image ? `${SITE_URL}${article.image}` : undefined,
    url: `${SITE_URL}/articles/${slug}`,
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Daniel Brandao",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Values come from our own articles.json; "<" escaped as defense-in-depth.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ArticleReader article={article} content={content} />
    </>
  );
}
