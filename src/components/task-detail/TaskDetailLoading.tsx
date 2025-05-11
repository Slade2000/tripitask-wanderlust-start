
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskDetailLoadingProps {
  onBack: () => void;
}

export default function TaskDetailLoading({ onBack }: TaskDetailLoadingProps) {
  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        </div>
        <div className="space-y-4">
          <Skeleton className="w-full h-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
          </div>
          <Skeleton className="w-full h-48" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
        </div>
      </div>
    </div>
  );
}
