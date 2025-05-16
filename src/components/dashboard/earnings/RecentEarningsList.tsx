
import { ProviderEarning } from "@/services/earnings/types";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentEarningItem } from "./RecentEarningItem";

interface RecentEarningsListProps {
  earnings: ProviderEarning[];
  loading: boolean;
}

export function RecentEarningsList({ earnings, loading }: RecentEarningsListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-3 rounded-md border border-gray-100">
            <div className="flex justify-between">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (earnings.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No earnings recorded yet.</p>
        <p className="mt-2 text-sm">Complete tasks to start earning!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {earnings.map((earning) => (
        <RecentEarningItem key={earning.id} earning={earning} />
      ))}
    </div>
  );
}
