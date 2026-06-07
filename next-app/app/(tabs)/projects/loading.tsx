import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="py-[clamp(40px,6vw,72px)]">
      {/* Section head */}
      <Skeleton className="mb-3 h-3 w-40 rounded" />
      <Skeleton className="mb-7 h-7 w-36 rounded" />

      {/* Project cards grid */}
      <div className="grid grid-cols-1 gap-4.5 wide:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
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
    </div>
  );
}
