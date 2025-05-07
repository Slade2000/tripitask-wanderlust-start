
import { useState } from 'react';
import { useSpatialRefSystems } from '@/hooks/useSpatialRefSystems';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Search, Loader } from "lucide-react";

export default function SpatialRefSystemsViewer() {
  const { 
    spatialSystems, 
    loading, 
    error, 
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    searchSystems 
  } = useSpatialRefSystems({ pageSize: 10 });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchSystems(searchTerm);
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const renderSystems = searchResults.length > 0 ? searchResults : spatialSystems;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-teal">Spatial Reference Systems</CardTitle>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Search by name or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !searchTerm.trim()}
          >
            {isSearching ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-8 w-8 animate-spin text-teal" />
          </div>
        ) : renderSystems.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">SRID</th>
                    <th className="px-4 py-2">Auth Name</th>
                    <th className="px-4 py-2">Auth SRID</th>
                  </tr>
                </thead>
                <tbody>
                  {renderSystems.map((system) => (
                    <tr key={system.srid} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{system.srid}</td>
                      <td className="px-4 py-2">{system.auth_name}</td>
                      <td className="px-4 py-2">{system.auth_srid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {searchResults.length === 0 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <Button
                    variant="outline" 
                    onClick={() => goToPage(page - 1)}
                    disabled={!hasPreviousPage}
                  >
                    Previous
                  </Button>
                  <span className="mx-4 flex items-center">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => goToPage(page + 1)}
                    disabled={!hasNextPage}
                  >
                    Next
                  </Button>
                </Pagination>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No spatial reference systems found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
