"use client";

import { ArticleCard } from "@/components/ArticleCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Article } from "@/types";

interface ArticleCarouselProps {
  articles: { article: Article; slug: string }[];
}

export function ArticleCarousel({ articles }: ArticleCarouselProps) {
  if (articles.length === 0) return null;

  return (
    <Carousel
      opts={{ align: "start", loop: false, dragFree: true }}
      className="w-full"
    >
      <CarouselContent className="-ml-3">
        {articles.map(({ article, slug }) => (
          <CarouselItem
            key={slug}
            className="pl-3 basis-[85%] sm:basis-[60%] md:basis-[45%]"
          >
            <ArticleCard article={article} slug={slug} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-4" />
      <CarouselNext className="hidden md:flex -right-4" />
    </Carousel>
  );
}
