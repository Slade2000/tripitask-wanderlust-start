
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SavedFilter } from '@/hooks/useSavedFilters';

interface SaveFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  filters: SavedFilter['filters'];
}

export function SaveFilterDialog({ open, onClose, onSave, filters }: SaveFilterDialogProps) {
  const [filterName, setFilterName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = () => {
    if (!filterName.trim()) return;
    
    setIsSubmitting(true);
    onSave(filterName.trim());
    setFilterName('');
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Filter</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filter-name">Filter Name</Label>
            <Input
              id="filter-name"
              placeholder="E.g. Nearby Gardening Jobs"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Filter Summary</h4>
            <div className="text-sm text-gray-500 space-y-1">
              {filters.searchQuery && <p>Search: {filters.searchQuery}</p>}
              {filters.selectedCategory && <p>Category: {filters.selectedCategory}</p>}
              {filters.minBudget && <p>Min Budget: ${filters.minBudget}</p>}
              {filters.maxBudget && <p>Max Budget: ${filters.maxBudget}</p>}
              {filters.location?.name && <p>Location: {filters.location.name}</p>}
              {filters.distanceRadius && <p>Distance: {filters.distanceRadius[0]} km</p>}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={!filterName.trim() || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Filter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
