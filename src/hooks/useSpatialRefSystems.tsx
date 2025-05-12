
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  SpatialRefSys, 
  getAllSpatialRefSystems, 
  getSpatialRefSystemById,
  searchSpatialRefSystems
} from '@/services/spatialReferenceService';

interface UseSpatialRefSystemsProps {
  initialPage?: number;
  pageSize?: number;
}

export function useSpatialRefSystems({ initialPage = 1, pageSize = 20 }: UseSpatialRefSystemsProps = {}) {
  const [spatialSystems, setSpatialSystems] = useState<SpatialRefSys[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const { user } = useAuth();

  // Load spatial reference systems
  useEffect(() => {
    async function loadSpatialSystems() {
      if (!user) {
        setError("Authentication required to access spatial reference systems");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, count } = await getAllSpatialRefSystems(page, pageSize);
        setSpatialSystems(data);
        setTotalCount(count);
        setError(null);
      } catch (err) {
        setError("Failed to load spatial reference systems");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadSpatialSystems();
  }, [page, pageSize, user]);
  
  // Function to load a specific spatial reference system
  const loadSpatialSystem = async (srid: number): Promise<SpatialRefSys | null> => {
    if (!user) {
      setError("Authentication required to access spatial reference systems");
      return null;
    }
    
    try {
      setLoading(true);
      const data = await getSpatialRefSystemById(srid);
      return data;
    } catch (err) {
      setError("Failed to load spatial reference system");
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to search spatial reference systems
  const searchSystems = async (searchTerm: string): Promise<SpatialRefSys[]> => {
    if (!user) {
      setError("Authentication required to access spatial reference systems");
      return [];
    }
    
    try {
      setLoading(true);
      const results = await searchSpatialRefSystems(searchTerm);
      return results;
    } catch (err) {
      setError("Failed to search spatial reference systems");
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Function to change page
  const goToPage = (newPage: number) => {
    setPage(newPage);
  };
  
  return {
    spatialSystems,
    loading,
    error,
    page,
    totalCount,
    pageSize,
    loadSpatialSystem,
    searchSystems,
    goToPage,
    totalPages: totalCount ? Math.ceil(totalCount / pageSize) : 0,
    hasNextPage: totalCount ? page < Math.ceil(totalCount / pageSize) : false,
    hasPreviousPage: page > 1
  };
}
