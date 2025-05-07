
import React from "react";
import { Button } from "@/components/ui/button";
import { Filter, RefreshCw, X } from "lucide-react";
import SearchBar from "./SearchBar";

interface SearchFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterOpen: boolean;
  toggleFilters: () => void;
  onRefresh: () => void;
  onClearFilters: () => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  filterOpen,
  toggleFilters,
  onRefresh,
  onClearFilters,
}) => {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Button 
        variant={filterOpen ? "default" : "outline"} 
        size="icon" 
        onClick={toggleFilters}
        className="flex-shrink-0"
      >
        <Filter className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="flex-shrink-0 hidden md:flex"
      >
        <RefreshCw className="h-4 w-4 mr-1" /> Refresh
      </Button>
      <Button 
        variant="ghost"
        size="sm"
        onClick={onClearFilters}
        className="flex-shrink-0 flex items-center gap-1"
      >
        <X className="h-4 w-4" /> Clear Filters
      </Button>
    </div>
  );
};

export default SearchFilterBar;
