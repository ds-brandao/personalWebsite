"use client";

import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Article } from "@/types";
import { Mermaid } from "@/components/Mermaid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface ArticleReaderProps {
  article: Article;
  content: string;
}

const proseClasses = `prose prose-neutral dark:prose-invert max-w-none
  prose-headings:font-display prose-headings:font-bold
  prose-h1:text-xl prose-h1:mt-8 prose-h1:mb-4
  prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
  prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2
  prose-p:text-[15px] prose-p:leading-[1.75]
  prose-li:text-[15px] prose-li:leading-[1.75]
  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
  prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
  prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:overflow-x-auto prose-pre:text-sm
  prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
  prose-img:rounded-lg
  prose-strong:text-foreground`;

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeRaw]}
      components={{
        pre({ children, ...props }) {
          const child = Array.isArray(children) ? children[0] : children;
          if (child && typeof child === "object" && "props" in child) {
            const childProps = child.props as Record<string, unknown>;
            if (
              typeof childProps.className === "string" &&
              childProps.className.includes("language-mermaid")
            ) {
              return <Mermaid chart={String(childProps.children).trim()} />;
            }
          }
          return <pre {...props}>{children}</pre>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function ArticleReader({ article, content }: ArticleReaderProps) {
  const router = useRouter();

  const header = (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="mr-1 size-4" />
        Back
      </Button>

      <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground leading-tight">
        {article.title}
      </h1>
      <div className="flex flex-wrap gap-2 mt-3 mb-6">
        {article.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    </>
  );

  return (
    <div className="py-6 md:py-10">
      {header}

      {/* Hero image header */}
      {article.image && (
        <div className="relative h-48 md:h-72 w-full overflow-hidden rounded-lg mb-8">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            style={
              article.objectPosition
                ? { objectPosition: article.objectPosition }
                : undefined
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      )}

      {/* Article content */}
      <article className={proseClasses}>
        <MarkdownContent content={content} />
      </article>
    </div>
  );
}
