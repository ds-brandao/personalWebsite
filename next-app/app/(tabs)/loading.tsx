import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-10 pb-10 md:pt-[clamp(40px,7vw,76px)] md:pb-[clamp(40px,6vw,72px)]">
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-5 gap-y-7 wide:grid-cols-[1.35fr_0.9fr] wide:gap-x-[clamp(28px,5vw,64px)] wide:gap-y-0">
          <div className="wide:mb-5.5">
            <Skeleton className="h-9 w-40 rounded md:h-16 md:w-64" />
            <Skeleton className="mt-2 h-9 w-48 rounded md:h-16 md:w-72" />
          </div>
          <div className="w-[36vw] max-w-48 wide:row-span-2 wide:w-auto wide:max-w-none">
            <Skeleton className="aspect-4/5 w-full rounded-[22px]" />
            <div className="mt-3 flex justify-center gap-2 wide:mt-4 wide:justify-start">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="size-8.5 rounded-[11px] wide:size-10" />
              ))}
            </div>
          </div>
          <div className="col-span-2 wide:col-span-1">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-md rounded" />
              <Skeleton className="h-4 w-3/4 max-w-sm rounded" />
            </div>
            <div className="mt-7 flex gap-3">
              <Skeleton className="h-11 w-36 rounded-full" />
              <Skeleton className="h-11 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Latest articles */}
      <section className="pb-[clamp(54px,8vw,92px)]">
        <Skeleton className="mb-3 h-3 w-28 rounded" />
        <Skeleton className="mb-7 h-7 w-44 rounded" />
        <div className="grid grid-cols-1 gap-5.5 wide:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
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
      </section>

      {/* Selected projects */}
      <section className="border-t border-border py-[clamp(54px,8vw,92px)]">
        <Skeleton className="mb-3 h-3 w-24 rounded" />
        <Skeleton className="mb-7 h-7 w-48 rounded" />
        <div className="grid grid-cols-1 gap-4.5 wide:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 rounded-[14px] border border-border p-5.5"
            >
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
      </section>

      {/* Recent activity */}
      <section className="border-t border-border py-[clamp(34px,5vw,54px)]">
        <Skeleton className="mb-4 h-3 w-32 rounded" />
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5 px-2 py-3">
              <Skeleton className="size-3.5 rounded-full" />
              <Skeleton className="h-4 flex-1 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
