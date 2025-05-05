
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        // Using a more generic approach to avoid TypeScript errors with Supabase tables
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('active', true)
          .order('name');

        if (error) {
          throw error;
        }

        // Type assertion to handle the data coming from Supabase
        setCategories((data || []) as Category[]);
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
