import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
  slug: string;
}

function toThumb(src: string): string {
  return src
    .replace("/images/blog/", "/images/blog/thumbs/")
    .replace(/\.(jpeg|jpg|png)$/i, ".webp");
}

export function ArticleCard({ article, slug }: ArticleCardProps) {
  return (
    <Link href={`/articles/${slug}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md group">
        {article.image && (
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={toThumb(article.image)}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              style={
                article.objectPosition
                  ? { objectPosition: article.objectPosition }
                  : undefined
              }
            />
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="font-display text-lg font-semibold text-foreground line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {article.summary}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
