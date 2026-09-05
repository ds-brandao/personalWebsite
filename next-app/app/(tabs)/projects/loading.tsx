import { ProjectGridSkeleton } from "@/components/ContentSkeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="py-[clamp(40px,6vw,72px)]">
      {/* Section head */}
      <Skeleton className="mb-3 h-3 w-40 rounded" />
      <Skeleton className="mb-7 h-7 w-36 rounded" />

      {/* Project cards grid */}
      <ProjectGridSkeleton />
    </div>
  );
}
