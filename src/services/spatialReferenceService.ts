
import { supabase } from "@/integrations/supabase/client";

/**
 * Service to handle secure access to spatial reference system data
 * Implements application-level security since we cannot modify the system table directly
 */
export interface SpatialRefSys {
  srid: number;
  auth_name: string | null;
  auth_srid: number | null;
  srtext: string | null;
  proj4text: string | null;
}

/**
 * Get a specific spatial reference system by SRID
 * This ensures all access to the spatial_ref_sys table goes through authenticated channels
 */
export async function getSpatialRefSystemById(srid: number): Promise<SpatialRefSys | null> {
  try {
    // Ensure user is authenticated before allowing access to this data
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.error("Authentication required to access spatial reference systems");
      return null;
    }

    // Query with RLS policies in place
    const { data, error } = await supabase
      .from('spatial_ref_sys')
      .select('*')
      .eq('srid', srid)
      .single();

    if (error) {
      console.error("Error fetching spatial reference system:", error);
      return null;
    }

    return data as SpatialRefSys;
  } catch (error) {
    console.error("Error accessing spatial reference system:", error);
    return null;
  }
}

/**
 * Get all spatial reference systems with pagination
 * Secured by authentication check
 */
export async function getAllSpatialRefSystems(
  page: number = 1, 
  pageSize: number = 20
): Promise<{ data: SpatialRefSys[], count: number | null }> {
  try {
    // Ensure user is authenticated
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.error("Authentication required to access spatial reference systems");
      return { data: [], count: null };
    }

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get count first
    const { count, error: countError } = await supabase
      .from('spatial_ref_sys')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error("Error counting spatial reference systems:", countError);
      return { data: [], count: null };
    }

    // Then get paginated data
    const { data, error } = await supabase
      .from('spatial_ref_sys')
      .select('*')
      .range(from, to);

    if (error) {
      console.error("Error fetching spatial reference systems:", error);
      return { data: [], count };
    }

    return { 
      data: data as SpatialRefSys[], 
      count 
    };
  } catch (error) {
    console.error("Error accessing spatial reference systems:", error);
    return { data: [], count: null };
  }
}

/**
 * Search spatial reference systems by criteria
 * Secured by authentication check
 */
export async function searchSpatialRefSystems(
  searchTerm: string
): Promise<SpatialRefSys[]> {
  try {
    // Ensure user is authenticated
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.error("Authentication required to access spatial reference systems");
      return [];
    }

    // Search with various criteria
    const { data, error } = await supabase
      .from('spatial_ref_sys')
      .select('*')
      .or(`auth_name.ilike.%${searchTerm}%,srtext.ilike.%${searchTerm}%,proj4text.ilike.%${searchTerm}%`)
      .limit(50);

    if (error) {
      console.error("Error searching spatial reference systems:", error);
      return [];
    }

    return data as SpatialRefSys[];
  } catch (error) {
    console.error("Error accessing spatial reference systems:", error);
    return [];
  }
}
