
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileLoadingProps {
  error?: boolean;
  onRetry?: () => void;
}

const ProfileLoading = ({ error = false, onRetry }: ProfileLoadingProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center h-40">
          {error ? (
            <div className="flex flex-col items-center gap-4">
              <Alert variant="destructive" className="border-0 bg-transparent">
                <AlertDescription className="text-center">
                  There was a problem loading your profile data.
                </AlertDescription>
              </Alert>
              
              {onRetry && (
                <Button 
                  variant="outline" 
                  onClick={onRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={16} className="mr-1" />
                  Try Again
                </Button>
              )}
            </div>
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
