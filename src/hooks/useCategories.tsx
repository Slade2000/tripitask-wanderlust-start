
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define the Category interface for the frontend
export interface Category {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}

// Simple interface for database data avoiding recursive type issues
interface DatabaseCategory {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  parent_id?: string | null;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        
        // Use explicit column names to avoid type issues
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, description, active, created_at, parent_id');
          
        if (error) {
          throw error;
        }
        
        const typedData: Category[] = [];
        
        if (Array.isArray(data)) {
          // Map the data to our Category interface
          data.forEach((item) => {
            typedData.push({
              id: item.id,
              name: item.name,
              description: item.description,
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
