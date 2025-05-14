
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardLoadingState = () => {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
      </div>
      <Skeleton className="h-10 w-40 mb-4" />
      <Skeleton className="h-40 rounded-lg mb-6" />
      <Skeleton className="h-10 w-40 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {[1, 2].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
      </div>
    </>
  );
};
