
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ProfileLoading = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          <Progress value={45} className="w-full h-1" />
          <p className="text-sm text-gray-500">Loading profile data...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileLoading;
