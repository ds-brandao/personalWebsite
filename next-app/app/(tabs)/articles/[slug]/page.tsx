import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/data";
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

  // Fetch markdown content at build time
  const fs = await import("fs");
  const path = await import("path");
  const mdPath = path.join(process.cwd(), "public", article.markdown);
  let content = "";
  try {
    content = fs.readFileSync(mdPath, "utf-8");
  } catch {
    content = "";
  }

  return <ArticleReader article={article} content={content} />;
}
