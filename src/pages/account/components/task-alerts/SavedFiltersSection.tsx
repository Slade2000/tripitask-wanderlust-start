
import { useState } from "react";
import { Trash2, Bell, PlayCircle } from "lucide-react";
import { SavedFilter } from "@/hooks/useSavedFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface SavedFiltersSectionProps {
  savedFilters: SavedFilter[];
  onDeleteFilter: (filterId: string) => void;
  isLoading: boolean;
}

export function SavedFiltersSection({
  savedFilters,
  onDeleteFilter,
  isLoading,
}: SavedFiltersSectionProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>(
    savedFilters.reduce((acc, filter) => ({ ...acc, [filter.id]: true }), {})
  );

  const handleToggleFilter = (filterId: string) => {
    setActiveFilters((prev) => {
      const isActive = !prev[filterId];
      
      // Show toast based on new state
      if (isActive) {
        toast.success("Alert activated");
      } else {
        toast.info("Alert deactivated");
      }
      
      return { ...prev, [filterId]: isActive };
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Filters</CardTitle>
          <CardDescription>Loading your saved filters...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (savedFilters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Filters</CardTitle>
          <CardDescription>
            You haven't saved any filters yet. Go to Find Work page to save filters.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell size={18} className="mr-2" />
          Saved Filters
        </CardTitle>
        <CardDescription>
          Manage your saved filters for task alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedFilters.map((filter) => (
          <div
            key={filter.id}
            className="border rounded-lg p-3 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{filter.name}</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={activeFilters[filter.id] || false}
                  onCheckedChange={() => handleToggleFilter(filter.id)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteFilter(filter.id)}
                >
                  <Trash2 size={16} className="text-gray-500" />
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Created on {formatDate(filter.createdAt)}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {filter.filters.searchQuery && (
                  <Badge variant="outline" className="text-xs">
                    Search: {filter.filters.searchQuery}
                  </Badge>
                )}
                {filter.filters.selectedCategory && (
                  <Badge variant="outline" className="text-xs">
                    Category: {filter.filters.selectedCategory}
                  </Badge>
                )}
                {filter.filters.location?.name && (
                  <Badge variant="outline" className="text-xs">
                    Location: {filter.filters.location.name}
                  </Badge>
                )}
                {filter.filters.distanceRadius && (
                  <Badge variant="outline" className="text-xs">
                    Distance: {filter.filters.distanceRadius[0]}km
                  </Badge>
                )}
                {filter.filters.minBudget && (
                  <Badge variant="outline" className="text-xs">
                    Min: ${filter.filters.minBudget}
                  </Badge>
                )}
                {filter.filters.maxBudget && (
                  <Badge variant="outline" className="text-xs">
                    Max: ${filter.filters.maxBudget}
                  </Badge>
                )}
              </div>
            </div>
            
            {activeFilters[filter.id] && (
              <Button 
                variant="link" 
                className="self-start p-0 h-auto text-sm flex items-center" 
                onClick={() => toast.info("Showing all matching tasks")}
              >
                <PlayCircle size={14} className="mr-1" />
                View matching tasks
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
