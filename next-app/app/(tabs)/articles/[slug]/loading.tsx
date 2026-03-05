import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleLoading() {
  return (
    <div className="py-6 md:py-10">
      {/* Back button (desktop) */}
      <Skeleton className="h-8 w-20 mb-6 rounded hidden md:block" />

      {/* Title */}
      <Skeleton className="h-8 md:h-10 w-full max-w-lg rounded" />
      <Skeleton className="h-8 md:h-10 w-2/3 max-w-sm rounded mt-2" />

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-3 mb-6">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>

      {/* Hero image */}
      <Skeleton className="h-48 md:h-72 w-full rounded-lg mb-8" />

      {/* Article body lines */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        <div className="pt-2" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}
