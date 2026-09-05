import { Skeleton } from "@/components/ui/skeleton";

export function ArticleGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5.5 wide:grid-cols-2" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-[14px] border border-border">
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
  );
}

export function ActivitySkeleton() {
  return (
    <div className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-3.5 px-2 py-3">
          <Skeleton className="size-3.5 rounded-full" />
          <Skeleton className="h-4 flex-1 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4.5 wide:grid-cols-2" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3 rounded-[14px] border border-border p-5.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-1/2 rounded" />
            <Skeleton className="h-4 w-14 rounded" />
          </div>
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}
