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
      <div className="grid grid-cols-1 gap-5.5 wide:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-[14px] border border-border"
          >
            <Skeleton className="aspect-video w-full" />
            <div className="space-y-2 p-5">
              <Skeleton className="h-3 w-32 rounded" />
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <div className="mt-3 flex gap-1.5">
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
