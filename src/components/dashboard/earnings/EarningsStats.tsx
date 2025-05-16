
import { DollarSign, Clock, Calendar } from "lucide-react";
import { ProviderEarningsStatistics } from "@/services/earnings/types";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "./StatCard";

interface EarningsStatsProps {
  statistics: ProviderEarningsStatistics | null;
  loading: boolean;
}

export function EarningsStats({ statistics, loading }: EarningsStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <StatCard 
        title="Available Balance" 
        value={formatCurrency(Number(statistics?.available_balance || 0))}
        icon={<DollarSign className="h-6 w-6 text-emerald-500" />}
        loading={loading}
      />
      <StatCard 
        title="Pending Earnings" 
        value={formatCurrency(Number(statistics?.pending_earnings || 0))}
        icon={<Clock className="h-6 w-6 text-amber-500" />}
        loading={loading}
      />
      <StatCard 
        title="Total Earnings" 
        value={formatCurrency(Number(statistics?.total_earnings || 0))}
        icon={<Calendar className="h-6 w-6 text-blue-500" />}
        loading={loading}
      />
    </div>
  );
}
