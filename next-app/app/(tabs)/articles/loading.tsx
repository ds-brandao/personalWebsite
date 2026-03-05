import { Skeleton } from "@/components/ui/skeleton";

export default function ArticlesLoading() {
  return (
    <div className="py-8 md:py-12">
      {/* Page title */}
      <Skeleton className="h-8 w-32 mb-6 rounded" />

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-4 w-20 rounded ml-auto" />
      </div>

      {/* Article cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border overflow-hidden"
          >
            <Skeleton className="h-40 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <div className="flex gap-1.5 mt-3">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
