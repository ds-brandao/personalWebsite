import { notFound } from "next/navigation";
import { getArticleBySlug, getArticleContent } from "@/lib/data";
import { ArticleReader } from "@/components/ArticleReader";

export const dynamic = "force-dynamic";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const content = await getArticleContent(article);

  return <ArticleReader article={article} content={content} />;
}
