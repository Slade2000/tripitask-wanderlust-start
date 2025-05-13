
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define the Category interface for the frontend
export interface Category {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        
        // Only select the columns that actually exist in the table
        // Note: If description doesn't exist, we'll add it as null in the mapping
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, active, created_at');
          
        if (error) {
          throw error;
        }
        
        const typedData: Category[] = [];
        
        if (Array.isArray(data)) {
          // Map the data to our Category interface
          data.forEach((item: any) => {
            typedData.push({
              id: item.id,
              name: item.name,
              description: null, // Handle the missing description field
              active: item.active !== undefined ? Boolean(item.active) : true
            });
          });
        }
        
        setCategories(typedData);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}
