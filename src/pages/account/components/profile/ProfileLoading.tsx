
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileLoadingProps {
  error?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  loadingMessage?: string;
}

const ProfileLoading = ({ 
  error = false, 
  errorMessage = "There was a problem loading your profile data.",
  onRetry,
  loadingMessage = "Loading profile data"
}: ProfileLoadingProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[160px] py-4">
          {error ? (
            <div className="flex flex-col items-center gap-4">
              <Alert variant="destructive" className="border-0 bg-transparent">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="text-center font-semibold">Profile Error</AlertTitle>
                <AlertDescription className="text-center">
                  {errorMessage}
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
              <p className="text-lg text-gray-500">{loadingMessage}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileLoading;
