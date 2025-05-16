
import { ProviderEarning } from "@/services/earnings/types";
import { formatCurrency } from "@/lib/utils";

interface RecentEarningItemProps {
  earning: ProviderEarning;
}

export function RecentEarningItem({ earning }: RecentEarningItemProps) {
  // Access task title via the joined tasks object from getProviderEarnings
  const taskTitle = earning.tasks?.title || "Task";
  // Format date
  const earnedDate = new Date(earning.created_at).toLocaleDateString();

  return (
    <div className="bg-white p-3 rounded-md border border-gray-100">
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium">{taskTitle}</h4>
          <p className="text-sm text-gray-600">
            {earning.status === 'pending' ? 'Available in 7 days' : 'Available for withdrawal'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-emerald-600">{formatCurrency(earning.net_amount)}</p>
          <p className="text-xs text-gray-500">{earnedDate}</p>
        </div>
      </div>
    </div>
  );
}
