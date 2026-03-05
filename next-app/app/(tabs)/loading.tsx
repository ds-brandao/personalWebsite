import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="py-8 md:py-12">
      {/* Social icons (mobile name + icons) */}
      <section className="mb-10 flex flex-col items-center">
        <Skeleton className="md:hidden h-8 w-48 mb-2 rounded" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="size-10 rounded-full" />
          ))}
        </div>
      </section>

      {/* Articles carousel */}
      <section className="mb-10">
        <Skeleton className="h-6 w-24 mb-4 rounded" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 basis-[85%] sm:basis-[60%] md:basis-[45%] rounded-lg border border-border overflow-hidden"
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
      </section>

      {/* Featured section */}
      <section className="mb-10">
        <Skeleton className="h-6 w-32 mb-4 rounded" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </section>

      {/* Activity feed */}
      <section>
        <Skeleton className="h-6 w-36 mb-4 rounded" />
        <div className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-3">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-2/3 rounded" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
