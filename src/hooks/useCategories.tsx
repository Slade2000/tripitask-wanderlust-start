
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}

// Define the actual shape of data coming from the database
interface DatabaseCategory {
  id: number | string;
  name: string;
  created_at: string;
  parent_id?: number | null;
  description?: string | null;
  active?: boolean | null;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('active', true)
          .order('name');

        if (error) {
          throw error;
        }

        // Transform the database result to match our Category interface
        const typedData: Category[] = [];
        if (Array.isArray(data)) {
          for (const item of data as DatabaseCategory[]) {
            typedData.push({
              id: String(item.id),
              name: item.name,
              description: item.description || null,
              active: item.active !== undefined ? Boolean(item.active) : true
            });
          }
        }

        setCategories(typedData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
