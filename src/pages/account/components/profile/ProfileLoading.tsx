
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface ProfileLoadingProps {
  error?: boolean;
}

const ProfileLoading = ({ error = false }: ProfileLoadingProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center h-40">
          {error ? (
            <Alert variant="destructive" className="border-0 bg-transparent">
              <AlertDescription className="text-center">
                There was a problem loading your profile data. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-lg text-gray-500">Loading profile data</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileLoading;
