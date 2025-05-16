
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EarningsStats } from "./earnings/EarningsStats";
import { RecentEarningsList } from "./earnings/RecentEarningsList";
import { useEarnings } from "./earnings/useEarnings";

interface EarningsPanelProps {
  userId: string;
}

export function EarningsPanel({ userId }: EarningsPanelProps) {
  const {
    earnings,
    statistics,
    loading,
    refreshing,
    handleRefreshEarnings
  } = useEarnings(userId);

  // Debug logs for earnings stats
  console.log("Rendering earnings panel with stats:", statistics);
  console.log("Total earnings value:", statistics?.total_earnings);
  console.log("Total earnings type:", typeof statistics?.total_earnings);

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Earnings</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshEarnings}
          disabled={refreshing}
          className="flex items-center gap-1"
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
      </CardHeader>
      <CardContent>
        <EarningsStats 
          statistics={statistics} 
          loading={loading} 
        />

        <h3 className="text-lg font-medium mb-2">Recent Earnings</h3>
        <RecentEarningsList 
          earnings={earnings}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}
