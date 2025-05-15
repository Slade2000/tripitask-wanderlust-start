
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getProviderEarnings, 
  getProviderEarningsStatistics 
} from "@/services/earnings";
import { ProviderEarning, ProviderEarningsStatistics } from "@/services/earnings/types";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Clock, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EarningsPanelProps {
  userId: string;
}

export function EarningsPanel({ userId }: EarningsPanelProps) {
  const [earnings, setEarnings] = useState<ProviderEarning[]>([]);
  const [statistics, setStatistics] = useState<ProviderEarningsStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEarningsData = async () => {
      setLoading(true);
      try {
        console.log("Loading earnings data for user:", userId);
        
        // Load earnings statistics
        const stats = await getProviderEarningsStatistics(userId);
        console.log("Earnings statistics:", stats);
        
        if (stats) {
          setStatistics(stats);
        }

        // Load recent earnings (limit to 5)
        const recentEarnings = await getProviderEarnings(userId);
        console.log("Recent earnings:", recentEarnings);
        setEarnings(recentEarnings.slice(0, 5));
      } catch (error) {
        console.error("Error loading earnings data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadEarningsData();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-md" />
              <Skeleton className="h-24 rounded-md" />
              <Skeleton className="h-24 rounded-md hidden md:block" />
            </div>
            <Skeleton className="h-64 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Debug logs for earnings stats
  console.log("Rendering earnings panel with stats:", statistics);
  console.log("Total earnings:", statistics?.total_earnings);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Your Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            title="Available Balance" 
            value={formatCurrency(statistics?.available_balance || 0)}
            icon={<DollarSign className="h-6 w-6 text-emerald-500" />}
          />
          <StatCard 
            title="Pending Earnings" 
            value={formatCurrency(statistics?.pending_earnings || 0)}
            icon={<Clock className="h-6 w-6 text-amber-500" />}
          />
          <StatCard 
            title="Total Earnings" 
            value={formatCurrency(statistics?.total_earnings || 0)}
            icon={<Calendar className="h-6 w-6 text-blue-500" />}
          />
        </div>

        <h3 className="text-lg font-medium mb-2">Recent Earnings</h3>
        {earnings.length > 0 ? (
          <div className="space-y-3">
            {earnings.map((earning) => (
              <RecentEarningItem key={earning.id} earning={earning} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No earnings recorded yet.</p>
            <p className="mt-2 text-sm">Complete tasks to start earning!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <p className="text-gray-600 text-sm">{title}</p>
        {icon}
      </div>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

interface RecentEarningItemProps {
  earning: ProviderEarning;
}

function RecentEarningItem({ earning }: RecentEarningItemProps) {
  // Access task title via the joined tasks object from getProviderEarnings
  const taskTitle = earning.tasks?.title || "Task";
  // Format date
  const earnedDate = new Date(earning.created_at).toLocaleDateString();

  return (
    <div className="bg-white p-3 rounded-md border border-gray-100">
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium">{taskTitle}</h4>
          <p className="text-sm text-gray-600">{earning.status === 'pending' ? 'Available in 7 days' : 'Available for withdrawal'}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-emerald-600">{formatCurrency(earning.net_amount)}</p>
          <p className="text-xs text-gray-500">{earnedDate}</p>
        </div>
      </div>
    </div>
  );
}
