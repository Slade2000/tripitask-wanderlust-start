import { useState, useEffect } from "react";
import { 
  getProviderEarnings, 
  getProviderEarningsStatistics,
  refreshProviderEarnings,
  ProviderEarning,
  ProviderEarningsStatistics
} from "@/services/earnings";
import { toast } from "sonner";

export function useEarnings(
  userId: string, 
  preloadedStatistics?: ProviderEarningsStatistics | null,
  initialLoading: boolean = false
) {
  const [earnings, setEarnings] = useState<ProviderEarning[]>([]);
  // Use preloadedStatistics if provided
  const [statistics, setStatistics] = useState<ProviderEarningsStatistics | null>(preloadedStatistics || null);
  // Start with initialLoading value
  const [loading, setLoading] = useState(preloadedStatistics ? false : initialLoading || true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Update statistics if preloadedStatistics changes
    if (preloadedStatistics) {
      setStatistics(preloadedStatistics);
    }
  }, [preloadedStatistics]);

  useEffect(() => {
    const loadEarningsData = async () => {
      // If we already have statistics from props, only load earnings
      if (preloadedStatistics) {
        try {
          // Load recent earnings (limit to 5)
          const recentEarnings = await getProviderEarnings(userId);
          console.log("Recent earnings loaded with preloaded statistics:", recentEarnings);
          setEarnings(recentEarnings.slice(0, 5));
          setLoading(false);
        } catch (error) {
          console.error("Error loading earnings data with preloaded statistics:", error);
          setLoading(false);
        }
      } else {
        // Otherwise load both statistics and earnings
        setLoading(true);
        try {
          console.log("Loading earnings data for user:", userId);
          
          // Load earnings statistics
          const stats = await getProviderEarningsStatistics(userId);
          console.log("Earnings statistics loaded:", stats);
          
          if (stats) {
            console.log("Setting earnings statistics state:", {
              total_earnings: stats.total_earnings,
              available_balance: stats.available_balance,
              pending_earnings: stats.pending_earnings,
              total_withdrawn: stats.total_withdrawn,
              jobs_completed: stats.jobs_completed
            });
            setStatistics(stats);
          } else {
            console.warn("No earnings statistics returned for user", userId);
          }

          // Load recent earnings (limit to 5)
          const recentEarnings = await getProviderEarnings(userId);
          console.log("Recent earnings loaded:", recentEarnings);
          setEarnings(recentEarnings.slice(0, 5));
        } catch (error) {
          console.error("Error loading earnings data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (userId) {
      loadEarningsData();
    } else {
      console.warn("useEarnings: No userId provided");
    }
  }, [userId, preloadedStatistics]);

  const handleRefreshEarnings = async () => {
    if (!userId || refreshing) return;
    
    setRefreshing(true);
    try {
      toast.info("Refreshing earnings data...");
      
      // Call the refresh function to sync earnings data
      const updatedStats = await refreshProviderEarnings(userId);
      
      if (updatedStats) {
        setStatistics(updatedStats);
        toast.success("Earnings data refreshed successfully");
        
        // Also refresh the earnings list
        const recentEarnings = await getProviderEarnings(userId);
        setEarnings(recentEarnings.slice(0, 5));
      } else {
        toast.error("Failed to refresh earnings data");
      }
    } catch (error) {
      console.error("Error refreshing earnings:", error);
      toast.error("An error occurred while refreshing earnings data");
    } finally {
      setRefreshing(false);
    }
  };

  return {
    earnings,
    statistics,
    loading,
    refreshing,
    handleRefreshEarnings
  };
}
