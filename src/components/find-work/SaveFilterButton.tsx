
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, PlusCircle } from "lucide-react";
import { SaveFilterDialog } from "./SaveFilterDialog";
import { SavedFilter } from "@/hooks/useSavedFilters";
import { useAuth } from "@/contexts/AuthContext";

interface SaveFilterButtonProps {
  currentFilters: SavedFilter['filters'];
  onSaveFilter: (name: string) => boolean;
}

export function SaveFilterButton({ currentFilters, onSaveFilter }: SaveFilterButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  
  const handleSave = (name: string) => {
    const success = onSaveFilter(name);
    if (success) {
      setDialogOpen(false);
    }
  };
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex items-center gap-1"
        onClick={() => setDialogOpen(true)}
        disabled={!user}
      >
        <BookmarkIcon size={16} className="mr-1" />
        Save Filter
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="sm:hidden"
        onClick={() => setDialogOpen(true)}
        disabled={!user}
      >
        <BookmarkIcon size={16} />
      </Button>
      
      <SaveFilterDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        filters={currentFilters}
      />
    </>
  );
}
