
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  tasksError: unknown;
  offersError: unknown;
}

export const DashboardError = ({ tasksError, offersError }: DashboardErrorProps) => {
  return (
    <Card className="bg-white p-6 text-center mb-6">
      <CardContent className="p-0">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">
            We encountered an issue while loading your dashboard data.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-teal hover:bg-teal-dark text-white"
          >
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
