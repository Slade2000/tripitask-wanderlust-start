
import { Card, CardContent } from "@/components/ui/card";

const ProfileLoading = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center h-40">
          <p className="text-lg text-gray-500">Loading profile data</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileLoading;
