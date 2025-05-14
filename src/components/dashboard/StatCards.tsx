
import { Briefcase, Clock, Award, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardsProps {
  activeTasks: any[];
  pendingOffers: any[];
  completedTasks: any[];
  totalEarnings: number;
}

export const StatCards = ({ 
  activeTasks, 
  pendingOffers, 
  completedTasks, 
  totalEarnings 
}: StatCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <Card className="bg-white shadow hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col items-center">
          <Briefcase className="h-6 w-6 text-teal mb-2" />
          <p className="text-sm text-gray-600 mb-1">Active Jobs</p>
          <p className="text-xl font-bold text-teal-dark">{activeTasks.length}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col items-center">
          <Clock className="h-6 w-6 text-teal mb-2" />
          <p className="text-sm text-gray-600 mb-1">Offers Pending</p>
          <p className="text-xl font-bold text-teal-dark">{pendingOffers.length}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col items-center">
          <Award className="h-6 w-6 text-teal mb-2" />
          <p className="text-sm text-gray-600 mb-1">Completed Jobs</p>
          <p className="text-xl font-bold text-teal-dark">{completedTasks.length}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col items-center">
          <DollarSign className="h-6 w-6 text-teal mb-2" />
          <p className="text-sm text-gray-600 mb-1">Earnings to Date</p>
          <p className="text-xl font-bold text-teal-dark">${totalEarnings} AUD</p>
        </CardContent>
      </Card>
    </div>
  );
};
