
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  created_at: string;
}

export function useSavedFilters() {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch saved filters from database
  const { data: savedFilters = [], isLoading: filtersLoading } = useQuery({
    queryKey: ['savedFilters', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('saved_filters')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        return data as SavedFilter[];
      } catch (error) {
        console.error('Error loading saved filters:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Insert new filter mutation
  const saveFilterMutation = useMutation({
    mutationFn: async ({ name, filters }: { name: string, filters: SavedFilter['filters'] }) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('saved_filters')
        .insert({
          user_id: user.id,
          name,
          filters
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedFilters', user?.id] });
      toast.success("Filter saved successfully");
    },
    onError: (error) => {
      console.error('Error saving filter:', error);
      toast.error("Failed to save filter");
    }
  });

  // Delete filter mutation
  const deleteFilterMutation = useMutation({
    mutationFn: async (filterId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', filterId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      return filterId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedFilters', user?.id] });
      toast.success("Filter deleted successfully");
    },
    onError: (error) => {
      console.error('Error deleting filter:', error);
      toast.error("Failed to delete filter");
    }
  });

  // Save filter function
  const saveFilter = (name: string, filters: SavedFilter['filters']) => {
    if (!user?.id) {
      toast.error("You must be logged in to save filters");
      return false;
    }

    try {
      saveFilterMutation.mutate({ name, filters });
      return true;
    } catch (error) {
      console.error('Error saving filter:', error);
      return false;
    }
  };

  // Delete filter function
  const deleteFilter = (filterId: string) => {
    if (!user?.id) return false;

    try {
      deleteFilterMutation.mutate(filterId);
      return true;
    } catch (error) {
      console.error('Error deleting filter:', error);
      return false;
    }
  };

  return {
    savedFilters,
    saveFilter,
    deleteFilter,
    isLoading: filtersLoading || saveFilterMutation.isPending || deleteFilterMutation.isPending
  };
}
