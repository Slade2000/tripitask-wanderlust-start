
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SavedFilter {
  id: string;
  name: string;
  filters: {
    searchQuery: string;
    selectedCategory: string;
    distanceRadius: number[];
    minBudget: string;
    maxBudget: string;
    location?: {
      name: string;
      latitude?: number;
      longitude?: number;
    } | null;
  };
  createdAt: string;
}

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load saved filters from localStorage
  useEffect(() => {
    if (user?.id) {
      const loadSavedFilters = () => {
        try {
          const storedFilters = localStorage.getItem(`taskFilters_${user.id}`);
          if (storedFilters) {
            setSavedFilters(JSON.parse(storedFilters));
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading saved filters:', error);
          setIsLoading(false);
        }
      };

      loadSavedFilters();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Save filters to localStorage
  const saveFilter = (name: string, filters: SavedFilter['filters']) => {
    if (!user?.id) {
      toast.error("You must be logged in to save filters");
      return false;
    }

    try {
      const newFilter: SavedFilter = {
        id: crypto.randomUUID(),
        name,
        filters,
        createdAt: new Date().toISOString(),
      };

      const updatedFilters = [...savedFilters, newFilter];
      localStorage.setItem(`taskFilters_${user.id}`, JSON.stringify(updatedFilters));
      setSavedFilters(updatedFilters);
      toast.success("Filter saved successfully");
      return true;
    } catch (error) {
      console.error('Error saving filter:', error);
      toast.error("Failed to save filter");
      return false;
    }
  };

  // Delete a filter
  const deleteFilter = (filterId: string) => {
    if (!user?.id) return false;

    try {
      const updatedFilters = savedFilters.filter(filter => filter.id !== filterId);
      localStorage.setItem(`taskFilters_${user.id}`, JSON.stringify(updatedFilters));
      setSavedFilters(updatedFilters);
      toast.success("Filter deleted successfully");
      return true;
    } catch (error) {
      console.error('Error deleting filter:', error);
      toast.error("Failed to delete filter");
      return false;
    }
  };

  return {
    savedFilters,
    saveFilter,
    deleteFilter,
    isLoading
  };
}
