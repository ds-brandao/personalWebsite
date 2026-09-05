import { ArticleGridSkeleton } from "@/components/ContentSkeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticlesLoading() {
  return (
    <div className="py-[clamp(40px,6vw,72px)]">
      {/* Section head */}
      <Skeleton className="mb-3 h-3 w-36 rounded" />
      <Skeleton className="mb-7 h-7 w-32 rounded" />

      {/* Filter chips */}
      <div className="mb-7 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-full" />
        ))}
      </div>

      {/* Article cards grid */}
      <ArticleGridSkeleton />
    </div>
  );
}
