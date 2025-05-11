
import { Loader2 } from "lucide-react";

export default function ThreadsLoading() {
  return (
    <div className="text-center py-12">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal" />
      <p>Loading messages...</p>
    </div>
  );
}
